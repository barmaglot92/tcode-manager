export type BaseGetParams = {
  Bucket: string;
};

export type GetSignedUrlParams = BaseGetParams & {
  videoId: string;
};

export type GetObjectsParams = BaseGetParams & {
  limit: number;
  ContinuationToken: string;
};
