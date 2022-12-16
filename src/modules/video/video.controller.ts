import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { appConfig } from 'src/utils/appConfig';
import { getUploadSignedUrl } from 'src/utils/common/s3/s3';
import { GetVideosDto } from './dto/GetVideosDto';
import { VideoService } from './video.service';

@Controller()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('/upload-finished')
  async uploadFinished(@Body() { videoId }: { videoId: string }) {
    const runResult = await this.videoService.startProcessing({ videoId });

    return { result: runResult };
  }

  @Get('/job/:id')
  async job(@Param('id') id) {
    return await this.videoService.getJob(id);
  }

  @Get('/job/:id/logs')
  async jobLogs(@Param('id') id) {
    return await this.videoService.getJobLogs(id);
  }

  @Get('/jobs')
  async jobs() {
    return await this.videoService.getJobs();
  }

  @Get('/upload-url')
  async getUploadUrl() {
    const { id: videoId } = await this.videoService.create();

    const uploadUrl = await getUploadSignedUrl({
      Bucket: appConfig.s3.source.bucket,
      videoId,
    });
    return {
      uploadUrl,
      videoId,
    };
  }

  @Get('/videos')
  async getVideos(@Query() query: GetVideosDto) {
    return this.videoService.findAll(query);
  }
}
