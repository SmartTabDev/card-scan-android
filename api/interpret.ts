import {AxiosResponse} from 'axios';

import axiosInstance from './axiosInstance';

export interface InterpretResponse {
  labels: string[];
}

const interpretImage = async (
  image: any,
): Promise<AxiosResponse<InterpretResponse> | void> => {
  try {
    const formData = new FormData();
    const currentDateTime = new Date().getTime();
    formData.append('image', {
      uri: image.path,
      name: `card-${currentDateTime}.png`,
      filename: `card-${currentDateTime}.png`,
      type: 'image/png',
    });
    return await axiosInstance.post('/interpret', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (e) {
    console.log('interpret image', e)
    console.log('Failed to interpret image');
  }
};

export {interpretImage};
