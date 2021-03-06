const { get, post } = require("./api");
const { extractVideoDetails } = require("./common");

const floatplaneDomain = 'https://www.floatplane.com/api';

module.exports.floatplaneDomain = floatplaneDomain;

module.exports.getChannels = async (cookie) => {
  try {
    const channels = await get({ url: `${floatplaneDomain}/v2/user/subscriptions`, headers: { cookie } });
    return channels || null;
  } catch (error) {
    console.error('ERROR - getChannels():', error);
    return null;
  }
};

module.exports.login = async (username, password) => {
  try {
    const login = await post({ url: `${floatplaneDomain}/v2/auth/login`, body: { username, password }});
    return login || null;
  } catch (error) {
    console.error('ERROR - login():', error);
    return null;
  }
};

module.exports.token2fa = async (token, cookie2fa) => {
  try {
    const token2fa = await post({ url: `${floatplaneDomain}/v2/auth/checkFor2faLogin`, headers: { 'Cookie': cookie2fa }, body: { token } });
    return token2fa || null;
  } catch (error) {
    console.error('ERROR - token2fa():', error);
    return null;
  }
};

module.exports.getVideos = async (channelId, cookie) => {
  try {
    const payload = await get({ url: `${floatplaneDomain}/v3/content/creator/list?ids=${channelId}`, headers: { cookie } });
    if (!payload) return null;
    // Get videos from blogPosts
    const videos = payload.blogPosts.filter(blogPost => blogPost.metadata.hasVideo);
    const minifiedVideos = videos.map(video => extractVideoDetails(video));
    return minifiedVideos;
  } catch (error) {
    console.error('ERROR - getVideos():', error);
    return null;
  }
};

module.exports.getVideoDownloads = async (videoId, cookie) => {
  try {
    const payload = await get({ url: `${floatplaneDomain}/v2/cdn/delivery?type=download&guid=${videoId}`, headers: { cookie } });
    return payload || null;
  } catch (error) {
    console.error('ERROR - getVideos():', error);
    return null;
  }
}

module.exports.buildVideoDownloadLink = (videoDownload, downloadQuality) => {
  const edge = videoDownload.edges.find(edge => edge.allowDownload);
  const uriWithQuality = videoDownload.resource.uri.replace('{qualityLevels}', downloadQuality);
  const uriWithToken = uriWithQuality.replace('{token}', videoDownload.resource.data.token);
  return `https://${edge.hostname}${uriWithToken}`;
}
