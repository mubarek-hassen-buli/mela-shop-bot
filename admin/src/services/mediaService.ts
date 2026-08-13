import { adminApi } from '../lib/axios';

export interface UploadMediaResponse {
  cloudinary_public_id: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
}

export const mediaService = {
  uploadImage: async (file: File): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await adminApi.post<UploadMediaResponse>('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await adminApi.delete(`/admin/media/${imageId}`);
  },
};
