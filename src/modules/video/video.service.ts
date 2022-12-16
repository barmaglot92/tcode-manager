import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Bull, { Queue } from 'bull';
import { TranscodeJobData } from 'src/types/TranscodeJobData';
import { appConfig } from 'src/utils/appConfig';
import { getDownloadSignedUrl, getUploadBulkUrl } from 'src/utils/common/s3/s3';
import { Repository } from 'typeorm';
import { GetVideosDto } from './dto/GetVideosDto';
import { VideoEntity, VideoState } from './entities/video.entity';

@Injectable()
export class VideoService implements OnModuleInit {
  constructor(
    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
    @InjectQueue('video') private videoQueue: Queue,
  ) {}

  async updateVideoState(videoId: string, state: VideoState) {
    return this.videoRepository.update(
      {
        id: videoId,
      },
      { state },
    );
  }

  onModuleInit() {
    this.videoQueue.on('global:waiting', async (jobId: string) => {
      const job = await this.getJob(jobId);

      this.updateVideoState(job.data.videoId, 'waiting');
    });

    this.videoQueue.on('global:active', async (jobId: string) => {
      const job = await this.getJob(jobId);

      this.updateVideoState(job.data.videoId, 'processing');
    });

    this.videoQueue.on('global:completed', async (jobId: string) => {
      const job = await this.getJob(jobId);

      this.updateVideoState(job.data.videoId, 'finished');
    });

    this.videoQueue.on('global:error', async (jobId: string) => {
      const job = await this.getJob(jobId);

      this.updateVideoState(job.data.videoId, 'error');
    });

    this.videoQueue.on('global:failed', async (jobId: string) => {
      const job = await this.getJob(jobId);

      this.updateVideoState(job.data.videoId, 'error');
    });
  }

  getJobLogs(jobId: string) {
    return this.videoQueue.getJobLogs(jobId);
  }

  getJobs() {
    return this.videoQueue.getJobCounts();
  }

  getJob(id: string) {
    return this.videoQueue.getJob(id);
  }

  async startProcessing({
    videoId,
  }: {
    videoId: string;
  }): Promise<VideoState | Bull.JobId> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });

    if (video.job_id) {
      if (video.state === 'finished') {
        console.log(videoId, 'done');
        return video.state;
      }

      const job = await this.videoQueue.getJob(video.job_id);
      const finished = Boolean(job.finishedOn);

      if (job && !finished) {
        console.log(videoId, 'job in progress', job.id);
        return video.state;
      }
    }

    const downloadUrl = await getDownloadSignedUrl({
      Bucket: appConfig.s3.source.bucket,
      videoId,
    });

    const presignedUpload = await getUploadBulkUrl({
      Bucket: appConfig.s3.result[0].bucket,
      videoId,
    });

    const jobData: TranscodeJobData = {
      downloadUrl,
      presignedUpload,
      videoId,
    };

    const job = await this.videoQueue.add('transcode', jobData);

    console.log('job created', job.id);

    video.job_id = String(job.id);
    this.videoRepository.save(video);

    return job.id;
  }

  create(): Promise<VideoEntity> {
    const videoEntity = this.videoRepository.create();
    return this.videoRepository.save(videoEntity);
  }

  findAll({
    offset,
    limit,
    order,
    orderBy,
  }: GetVideosDto): Promise<VideoEntity[]> {
    return this.videoRepository.find({
      order: { [orderBy]: order },
      take: limit,
      skip: offset,
    });
  }

  // async runProcess({ videoId }: { videoId: string }) {
  //   const downloadUrl = await getDownloadSignedUrl({
  //     videoId,
  //     Bucket: appConfig.s3.source.bucket,
  //   });

  //   const videoUrl = await getDownloadSignedUrl({
  //     videoId,
  //     Bucket: appConfig.s3.source.bucket,
  //   });

  //   // this.messageService.runProcess({ downloadUrl });
  // }
}
