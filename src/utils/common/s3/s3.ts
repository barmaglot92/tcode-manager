import * as AWS from 'aws-sdk';
import { appConfig } from '../../appConfig';
import { GetObjectsParams, GetSignedUrlParams } from './types';

const { endpoint: sourceEndpoint, creds: sourceCreds } = appConfig.s3.source;

const sourceClient = new AWS.S3({
  endpoint: sourceEndpoint,
  accessKeyId: sourceCreds.AWS_USER_KEY,
  secretAccessKey: sourceCreds.AWS_USER_SECRET_KEY,
});

export const getUploadSignedUrl = ({ videoId, Bucket }: GetSignedUrlParams) => {
  return sourceClient.getSignedUrlPromise('putObject', {
    Bucket,
    Key: `${videoId}/video.mp4`,
    Expires: 3600,
  });
};

export const getUploadBulkUrl = ({
  videoId,
  Bucket,
}: GetSignedUrlParams): Promise<AWS.S3.PresignedPost> => {
  return new Promise((resolve, reject) =>
    sourceClient.createPresignedPost(
      {
        Bucket,
        Expires: 3600,
        Conditions: [
          { acl: 'public-read' },
          { bucket: Bucket },
          ['starts-with', '$key', `${videoId}/`],
        ],
        Fields: { acl: 'public-read' },
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      },
    ),
  );
};

export const getDownloadSignedUrl = ({
  videoId,
  Bucket,
}: GetSignedUrlParams) => {
  return sourceClient.getSignedUrlPromise('getObject', {
    Bucket,
    Key: `${videoId}/video.mp4`,
    Expires: 3600,
  });
};

export const getObjects = ({
  Bucket,
  ContinuationToken,
  limit,
}: GetObjectsParams): Promise<AWS.S3.ListObjectsV2Output> => {
  return new Promise((resolve, reject) =>
    sourceClient.listObjectsV2(
      {
        Bucket,
        ContinuationToken,
        MaxKeys: limit,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      },
    ),
  );
};

// export const uploadFile = ({
//   videoId,
//   file,
// }: {
//   file: Express.Multer.File;
//   videoId: string;
// }) => {
//   return new Promise((resolve, reject) =>
//     sourceClient.putObject(
//       {
//         Bucket: sourceBucket,
//         Key: `${videoId}/video.mp4`,
//         ContentType: 'video/mp4',
//         Body: file.buffer,
//       },
//       (err, data) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(data);
//         }
//       },
//     ),
//   );
// };
