import lodash from 'lodash';
import { gql } from 'apollo-server-micro';
import { PostType, Resolvers, YouTubeVideo } from '../gql_types';
import { postsRepository } from '../posts/postsRepository';
import { getYouTubeVideosFromFeed } from './getYouTubeVideosFromFeed';

export const typeDefs = gql`
  # Defaults
  input YouTubeVideosFilters {
    date: FieldFilter
    postType: FieldFilter
  }
  input YouTubeVideoInput {
    limit: Int
    offset: Int
    filter: YouTubeVideosFilters
  }

  # ============================================================
  # Base Type
  type YouTubeVideo {
    title: String
    url: String
    date: String
    excerpt: String
  }

  # Query
  extend type Query {
    # youtubeVideo(input: YouTubeVideoInput): YouTubeVideo
    youtubeVideos(input: YouTubeVideoInput): [YouTubeVideo]!
  }
  
  # Mutation
  type CreateYouTubeVideosPayload {
    youtubeVideos: [YouTubeVideo]
  }
  extend type Mutation {
    """
    This mutation must called only in CI environment.
    - 1. It hits YouTube feed URL.
    - 2. Get the latest vídeos.
    - 3. Try to sync them with the local cache of videos.
    """
    syncYouTubeVideos: CreateYouTubeVideosPayload
  }
`;

const resolvers: Resolvers = {
  Query: {
    async youtubeVideos(_, { input } = {}) {
      const youtubeVideos = await postsRepository().getAllPostsByPostType(PostType.YoutubeVideo, { input });
      return youtubeVideos;
    }
  },
  Mutation: {
    async syncYouTubeVideos(): Promise<any> {
      // Get all needed data;
      const youtubeVideosCached = await postsRepository().getAllPostsByPostType(PostType.YoutubeVideo, { input: {} });
      const youtubeVideosFromFeed = await getYouTubeVideosFromFeed();
      const youtubeVideosFromFeedFormated: YouTubeVideo[] = youtubeVideosFromFeed.map((youtubeVideoFromFeed) => {
        return {
          title: youtubeVideoFromFeed.title,
          url: youtubeVideoFromFeed.url,
          date: youtubeVideoFromFeed.date,
          excerpt: youtubeVideoFromFeed.description,
        }
      });
      // Get difference between 2 arrays
      const youtubeVideosToCreate = lodash.differenceBy(youtubeVideosFromFeedFormated, youtubeVideosCached, 'title');
      // Create the videos
      const createdVideos = await postsRepository().createPostsByPostType(PostType.YoutubeVideo, {
        input: {
          posts: youtubeVideosToCreate,
        }
      });

      return {
        youtubeVideos: createdVideos,
      };
    }
  },
};

export const youtubeModule = {
  typeDefs,
  resolvers,
};