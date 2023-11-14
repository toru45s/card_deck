import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';
import Cookies from "js-cookie";

const apiUrl = process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT;
export const httpClient = (url, options = {}) => {
    options.headers = new Headers({ 'x-access-token': Cookies.get('token') });

    return fetchUtils.fetchJson(url, options);
};

const dataProvider = {

    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json.map(resource => {resource.id = resource._id; return resource;}),
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        }));
    },

    getOne: (resource, params) => {
        let query = '';

        if (params.previousData && typeof params.previousData.user_id !== "undefined") {
            query = '?' + stringify({filter: {user_id: params.previousData.user_id}});
        }

        if (resource === 'userdeck') {
            const href = window.location.href;
            query = '?' + href.split('?').pop();
        }
        return httpClient(`${apiUrl}/${resource}/${params.id}${query}`).then(({json}) => ({
            data: {...json, id: json._id},
        }))
    },

    getMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json.map(resource => {resource.id = resource._id; return resource;}) }));
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params._id,
            }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json.map(resource => {resource.id = resource._id; return resource;}),
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        }));
    },

    update: (resource, params) => {
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json}))
    },

    updateMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },

    create: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...params.data, id: json._id },
        })),

    delete: (resource, params) => {
        let query = '';
        if (params.previousData && typeof params.previousData.user_id !== "undefined") {
            query = '?' + stringify({filter: JSON.stringify({user_id: params.previousData.user_id})});
        }
        return httpClient(`${apiUrl}/${resource}/${params.id}${query}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json}));
    },

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'DELETE',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    }

};

const uploadDataProvider = {
    ...dataProvider,
    create: (resource, params) => {
        const image = params.data.image;
        if ((resource === 'cards' || resource === 'backgrounds') && image) {

            const newPictures = image.filter(
                p => p.rawFile instanceof File
            );

            return Promise.all(newPictures.map(convertFileToBase64))
                .then(transformedNewPictures =>
                    dataProvider.create(resource, {
                        ...params,
                        data: {
                            ...params.data,
                            images: transformedNewPictures,
                        },
                    })
                );
        } else if ((resource !== 'backgrounds' && resource !== 'decks') || !image || typeof image.rawFile === "undefined") {
            // fallback to the default implementation
            return dataProvider.create(resource, params);
        }

        return convertFileToBase64(image)
            .then(transformedNewPicture =>
                dataProvider.create(resource, {
                    ...params,
                    data: {
                        ...params.data,
                        image: transformedNewPicture,
                        back: transformedNewPicture,
                    },
                })
            );
    },
    update: (resource, params) => {
        const image = params.data.image;
        if ((resource !== 'cards' && resource !== 'backgrounds' && resource !== 'decks') || !image || typeof image.rawFile === "undefined") {
            // fallback to the default implementation
            return dataProvider.update(resource, params);
        }


        return convertFileToBase64(image)
            .then(transformedNewPicture =>
                dataProvider.update(resource, {
                    ...params,
                    data: {
                        ...params.data,
                        image: transformedNewPicture,
                        back: transformedNewPicture,
                    },
                })
            );
    },
};

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of data provider decoration.
 */
const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file.rawFile);
    });

export default uploadDataProvider;
