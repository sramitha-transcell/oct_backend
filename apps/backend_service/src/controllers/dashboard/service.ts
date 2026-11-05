import {
    Project,
    NociceptionAssay,
    GrowthFactorQuantification,
    AdventitiousAgents,
    InducedInflammation,
    MycoplasmaTesting,
    WoundHealing,
    BarrierIntegrity,
} from '@oct-backend/shared-utils';

class DashboardService {

    private filterStatusKeys(statusAgg: Array<{ _id: any; count: number }>): Record<string, number> {
        const status: Record<string, number> = {};
        for (const item of statusAgg) {
            const rawKey = item._id ? String(item._id).trim() : 'unspecified';
            const normalized = rawKey.toLowerCase().replace(/[\s-_]+/g, '_');
            // Exclude "in_progress" / "in-progress" and "active" as requested
            if (normalized.includes('in_progress') || normalized === 'active') {
                continue;
            }
            status[rawKey] = (status[rawKey] || 0) + item.count;
        }
        return status;
    }

    private mergeStatuses(...statusObjects: Array<Record<string, number>>): Record<string, number> {
        const merged: Record<string, number> = {};
        for (const obj of statusObjects) {
            if (obj) {
                for (const [k, v] of Object.entries(obj)) {
                    merged[k] = (merged[k] || 0) + v;
                }
            }
        }
        return merged;
    }

    private async getSubmoduleMetric(model: any, filter: any = {}) {
        const [total, statusAgg] = await Promise.all([
            model.countDocuments(filter),
            model.aggregate([
                { $match: filter },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ])
        ]);

        return {
            total,
            status: this.filterStatusKeys(statusAgg)
        };
    }

    async getDashboard(query: any = {}) {
        try {
            const rawProjectId = query?.project_id || query?.id;
            let assayFilter: any = {};
            let projectFilter: any = {};

            if (rawProjectId !== undefined && rawProjectId !== null && rawProjectId !== '') {
                const numProjectId = !isNaN(Number(rawProjectId)) ? Number(rawProjectId) : rawProjectId;
                assayFilter.project_id = numProjectId;
                projectFilter = {
                    "$or": [
                        { "id": numProjectId },
                        { "project_unique_id": String(rawProjectId) }
                    ]
                };
            }

            // 1. Projects stats
            const [totalProjects, projectStatusAgg] = await Promise.all([
                Project.countDocuments(projectFilter),
                Project.aggregate([
                    { $match: projectFilter },
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ])
            ]);

            // 2. Submodule metrics across all 7 assays in parallel
            const [
                nociStats,
                growthStats,
                adventitiousStats,
                inducedInflammationStats,
                mycoplasmaStats,
                woundHealingStats,
                barrierIntegrityStats,
                // Distinct project IDs per module
                mechNociProjects,
                mechGrowthProjects,
                safetyAdvProjects,
                safetyInflamProjects,
                safetyMycoProjects,
                effWoundProjects,
                effBarrierProjects
            ] = await Promise.all([
                this.getSubmoduleMetric(NociceptionAssay, assayFilter),
                this.getSubmoduleMetric(GrowthFactorQuantification, assayFilter),
                this.getSubmoduleMetric(AdventitiousAgents, assayFilter),
                this.getSubmoduleMetric(InducedInflammation, assayFilter),
                this.getSubmoduleMetric(MycoplasmaTesting, assayFilter),
                this.getSubmoduleMetric(WoundHealing, assayFilter),
                this.getSubmoduleMetric(BarrierIntegrity, assayFilter),
                // Distinct project queries
                NociceptionAssay.distinct('project_id', assayFilter),
                GrowthFactorQuantification.distinct('project_id', assayFilter),
                AdventitiousAgents.distinct('project_id', assayFilter),
                InducedInflammation.distinct('project_id', assayFilter),
                MycoplasmaTesting.distinct('project_id', assayFilter),
                WoundHealing.distinct('project_id', assayFilter),
                BarrierIntegrity.distinct('project_id', assayFilter)
            ]);

            // Assigned project sets
            const mechProjectIds = new Set([...mechNociProjects, ...mechGrowthProjects].filter(id => id != null));
            const safetyProjectIds = new Set([...safetyAdvProjects, ...safetyInflamProjects, ...safetyMycoProjects].filter(id => id != null));
            const effProjectIds = new Set([...effWoundProjects, ...effBarrierProjects].filter(id => id != null));

            const allAssayProjectIds = new Set([
                ...mechProjectIds,
                ...safetyProjectIds,
                ...effProjectIds
            ]);

            // Assigned vs Unassigned projects count
            const assignedConditions: any[] = [
                { "assigned_modules.0": { $exists: true } },
                { "modules.0": { $exists: true } },
                { module: { $exists: true, $ne: null, $nin: ["", []] } }
            ];

            if (allAssayProjectIds.size > 0) {
                assignedConditions.push({ id: { $in: Array.from(allAssayProjectIds) } });
            }

            const assignedQuery = Object.keys(projectFilter).length > 0
                ? { $and: [projectFilter, { $or: assignedConditions }] }
                : { $or: assignedConditions };

            const assignedProjectsCount = await Project.countDocuments(assignedQuery);
            const unassignedProjectsCount = Math.max(0, totalProjects - assignedProjectsCount);

            const projectStats = {
                total: totalProjects,
                assigned: assignedProjectsCount,
                unassigned: unassignedProjectsCount,
                status: this.filterStatusKeys(projectStatusAgg)
            };

            // Module rollups
            const mechanisticAnalysisModule = {
                name: "Mechanistic Analysis",
                total_assays: nociStats.total + growthStats.total,
                status: this.mergeStatuses(nociStats.status, growthStats.status)
            };

            const safetyAssessmentModule = {
                name: "Safety Assessment",
                total_assays: adventitiousStats.total + inducedInflammationStats.total + mycoplasmaStats.total,
                status: this.mergeStatuses(adventitiousStats.status, inducedInflammationStats.status, mycoplasmaStats.status)
            };

            const efficacyAssessmentModule = {
                name: "Efficacy Assessment",
                total_assays: woundHealingStats.total + barrierIntegrityStats.total,
                status: this.mergeStatuses(woundHealingStats.status, barrierIntegrityStats.status)
            };

            // Total assays count
            const totalAssaysCount =
                mechanisticAnalysisModule.total_assays +
                safetyAssessmentModule.total_assays +
                efficacyAssessmentModule.total_assays;

            return {
                projects: projectStats,
                modules: {
                    mechanistic_analysis: mechanisticAnalysisModule,
                    safety_assessment: safetyAssessmentModule,
                    efficacy_assessment: efficacyAssessmentModule
                },
                submodules: {
                    mechanistic_analysis: {
                        nociception_assay: {
                            label: "Nociception Assay",
                            total: nociStats.total,
                            status: nociStats.status
                        },
                        growth_factor_quantification: {
                            label: "Growth Factor Quantification",
                            total: growthStats.total,
                            status: growthStats.status
                        }
                    },
                    safety_assessment: {
                        adventitious_agents: {
                            label: "Adventitious Agents (Viral Testing)",
                            total: adventitiousStats.total,
                            status: adventitiousStats.status
                        },
                        induced_inflammation: {
                            label: "Induced Inflammation",
                            total: inducedInflammationStats.total,
                            status: inducedInflammationStats.status
                        },
                        mycoplasma_testing: {
                            label: "Mycoplasma Testing",
                            total: mycoplasmaStats.total,
                            status: mycoplasmaStats.status
                        }
                    },
                    efficacy_assessment: {
                        wound_healing: {
                            label: "Wound Healing (Scratch Assay)",
                            total: woundHealingStats.total,
                            status: woundHealingStats.status
                        },
                        barrier_integrity: {
                            label: "Barrier Integrity (TEER)",
                            total: barrierIntegrityStats.total,
                            status: barrierIntegrityStats.status
                        }
                    }
                },
                total_assays_count: totalAssaysCount
            };
        } catch (err) {
            console.log("Error in DashboardService.getDashboard ====>>>", err);
            throw err;
        }
    }
}

export default DashboardService;

