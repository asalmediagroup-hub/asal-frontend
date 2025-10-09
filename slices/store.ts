import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './authApi';
import { userApi } from './userApi';
import { rolesApi } from './roleApi';
import { categoryApi } from './categoryApi';
import { servicesApi } from './serviceApi';
import { brandApi } from './brandApi';
import { packageApi } from './packageApi';
import { newsApi } from "./newsApi"
import { portfolioApi } from "./portfolioApi"
import { partnersReviewApi } from "./partnersReviewApi"

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [rolesApi.reducerPath]: rolesApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [servicesApi.reducerPath]: servicesApi.reducer,
        [brandApi.reducerPath]: brandApi.reducer,
        [packageApi.reducerPath]: packageApi.reducer,
        [partnersReviewApi.reducerPath]: partnersReviewApi.reducer,
        [newsApi.reducerPath]: newsApi.reducer,
        [portfolioApi.reducerPath]: portfolioApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            userApi.middleware,
            rolesApi.middleware,
            categoryApi.middleware,
            servicesApi.middleware,
            brandApi.middleware,
            newsApi.middleware,
            portfolioApi.middleware,
            packageApi.middleware,
            partnersReviewApi.middleware,
        ),
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);


