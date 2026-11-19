import router from './router';
import Handler from './handler';
import FileUploadService from './service';
export * from './validation';

export {
    router as fileUploadRouter,
    Handler as FileUploadHandler,
    FileUploadService
};

export default router;

