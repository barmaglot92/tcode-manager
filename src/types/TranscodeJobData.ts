export type TranscodeJobData = {
  downloadUrl: string;
  presignedUpload: AWS.S3.PresignedPost;
  videoId: string;
};
