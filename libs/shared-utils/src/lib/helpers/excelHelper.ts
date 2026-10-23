import * as Excel from 'exceljs';
import * as https from 'https';
import { Readable } from 'stream';

// Patch exceljs to gracefully handle worksheets that reference missing comment drawings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WorksheetXform = require('exceljs/lib/xlsx/xform/sheet/worksheet-xform');

if (!(WorksheetXform as any).__patchedForMissingComments) {
    const originalReconcile = WorksheetXform.prototype.reconcile;
    WorksheetXform.prototype.reconcile = function patchedReconcile(model: any, options: any) {
        if (options) {
            const ensureCollection = (collection: any) => new Proxy(collection || {}, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                get(target: any, prop: string | symbol) {
                    if (typeof prop === 'symbol') {
                        return target[prop as any];
                    }
                    if (!(prop in target)) {
                        target[prop] = { comments: [] };
                    }
                    return target[prop];
                }
            });

            options.comments = ensureCollection(options.comments);
            options.vmlDrawings = ensureCollection(options.vmlDrawings);
        }

        return originalReconcile.call(this, model, options);
    };
    (WorksheetXform as any).__patchedForMissingComments = true;
}

class ExcelHelper {
    async readExcelFile(url:any) {
        var promise=new Promise((resolve, reject)=>{

        
        https.get(url, (resp) => {
            const chunks:any = [];
            resp.on('data', (data) => { 
                // console.log("data=====================>>>>");
                 chunks.push(data); 
                })
                .on('end', async() => {

                    var workbook = new Excel.Workbook();
                    var stream = Readable.from(chunks);

                    //Use then function to executed code that need to perform immediately after readFile
                    await workbook.xlsx.read(stream).then(function () {
                        console.log("XLSX Read Completed ...(excel to json ready)");
                        //Use sheetName in getWorksheet function
                        var worksheet:any = workbook.getWorksheet(1);
                        //Use nested iterator to read cell in rows 
                        //First iterator for rows in sheet
                        var excel_to_json:any = [];

                        worksheet.eachRow({ includeEmpty: false }, function (row:any, rowNumber:any) {
                            var excel_to_json_row:any = [];
                            //console.log("Current Row:" + rowNumber);
                            //Second iterator for cells in row
                            row.eachCell({ includeEmpty: true }, function (cell:any, colNumber:any) {
                                excel_to_json_row.push(cell.value);
                                //print row number, column number and cell value at[row][col]
                                //console.log("Cell Value=" + cell.value + " for cell [" + rowNumber + "]" + "[" + colNumber + "]");
                                /*
                                    write code
                                */
                            });
                            excel_to_json.push(excel_to_json_row)
                        });

                        // console.log("excel_to_json", excel_to_json);
                        resolve(excel_to_json);
                    })
                    .catch((e: any) => reject(e));
                })
        })

    });
    return promise;
    }

   
}

export {ExcelHelper} ;
