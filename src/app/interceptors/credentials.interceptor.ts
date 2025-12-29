import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    // Clone the request and add withCredentials for session/cookie handling
    const clonedReq = req.clone({
        withCredentials: true
    });
    return next(clonedReq);
};
