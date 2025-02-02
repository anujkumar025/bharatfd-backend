import client from './../config/redis_cache.js'

export async function getOneFromCache(lang, key) {
  try {
    const data = await client.hGet(lang, key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return null;
  } catch (err) {
    console.error(`Cache read error for lang: ${lang}, key: ${key}`, err);
    return null;
  }
}

export async function getAllFromCache(lang) {
  try {
    const data = await client.hGetAll(lang);
    for (const id in data) {
      try {
        data[id] = JSON.parse(data[id]);
      } catch (e) {
        // if parsing fails, leave the string as is.
      }
    }
    return data;
  } catch (err) {
    console.error('Cache read error:', err);
    return null;
  }
}

export async function setToCache(lang, key, value, expiration = 300) {
  try {
    await client.hSet(lang, key, value);
    await client.expire(lang, expiration);
  } catch (err) {
    console.error('Cache write error:', err);
  }
}

export async function getCachedLanguages(){
  try{
    const keys = await client.keys("*");
    return keys.filter((key) => key !== "en");
  }
  catch(err){
    console.error("Error fetching cached languages:", err);
    return [];
  }
}

export async function refreshCacheTTL(lang) {
  try {
    await client.expire(lang, 300); // Set expiry to 24 hours (adjust as needed)
    console.log(`TTL refreshed for language: ${lang}`);
  } catch (err) {
    console.error(`Error refreshing TTL for ${lang}:`, err);
  }
}

export async function deleteFromCache(lang, id) {
  try {
    await client.hDel(lang, id);
    console.log(`Deleted FAQ ${id} from Redis under language: ${lang}`);
  } catch (err) {
    console.error(`Error deleting FAQ ${id} from Redis (${lang}):`, err);
  }
}

