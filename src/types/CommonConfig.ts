type S3Config = {
  creds: {
    AWS_REGION: string;
    AWS_USER_KEY: string;
    AWS_USER_SECRET_KEY: string;
  };
  bucket: string;
  endpoint: string;
};

export type CommonConfig = {
  s3: {
    source: S3Config;
    result: S3Config[];
  };
};
