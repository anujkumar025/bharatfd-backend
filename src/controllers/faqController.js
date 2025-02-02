import FAQ from "../models/FAQ.js";
import translateText from "./../services/translateService.js";
import { getAllFromCache, getCachedLanguages, setToCache, refreshCacheTTL, deleteFromCache, getOneFromCache } from './../services/cacheService.js'; // Redis helper functions


export async function getSingleFAQ(req, res) {
  try {
    const { id } = req.params;
    const { lang } = req.query; // e.g. "en", "hi", etc.

    // CASE 1: English (or no language provided)
    if (!lang || lang === "en") {
      // Try to retrieve from Redis English hash
      let cachedEnglish = await getOneFromCache("en", id);
      if (cachedEnglish) {
        return res.json(cachedEnglish);
      }

      // Otherwise, fetch from MongoDB
      const faq = await FAQ.findById(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      const englishData = {
        _id: id,
        question: faq.question,
        answer: faq.answer
      };

      // Cache the English FAQ in Redis (with key "en")
      await setToCache("en", id, JSON.stringify(englishData));

      return res.json(englishData);
    }

    // CASE 2: Non-English language requested
    // Check if translation already exists in Redis under the requested language
    let cachedTranslation = await getOneFromCache(lang, id);
    if (cachedTranslation) {
      return res.json(cachedTranslation);
    }

    // Retrieve the English version from Redis (or MongoDB if not cached)
    let cachedEnglish = await getOneFromCache("en", id);
    let englishData;
    if (cachedEnglish) {
      englishData = cachedEnglish;
    }
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    if(faq.translations.has(lang)){
      return res.json(faq.translations[lang]);
    }

    
    englishData = {
      _id: id,
      question: faq.question,
      answer: faq.answer
    };
    await setToCache("en", id, JSON.stringify(englishData));
    
    // Translate question and answer concurrently
    const [translatedQuestion, translatedAnswer] = await Promise.all([
      translateText(englishData.question, lang).catch(() => englishData.question),
      translateText(englishData.answer, lang).catch(() => englishData.answer)
    ]);
    
    const translatedData = {
      question: translatedQuestion,
      answer: translatedAnswer
    };
    
    const existingTranslations = faq.translations.get(lang) || {};
    // Merge with new translations
    const mergedTranslations = { ...existingTranslations, ...translatedData };
    // Set the merged version
    faq.translations.set(lang, mergedTranslations);


    const forCache = {
      _id: id,
      question: translatedQuestion,
      answer: translatedAnswer
    }
    await faq.save();
    // Cache the translated FAQ in Redis under the requested language hash
    await setToCache(lang, id, JSON.stringify(forCache));


    return res.json(translatedData);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({ message: "Error fetching FAQ", error: error.message });
  }
}



// Get all FAQs
export async function getFAQs(req, res) { 
  try {
    const { lang } = req.query;

    if (!lang || lang === "en") {
      // let englishCache = await getAllFromCache("en");
      // if (englishCache && Object.keys(englishCache).length > 0) {
      //   return res.json(Object.values(englishCache));
      // }
      const faqsFromDB = await FAQ.find();
      const englishFaqs = faqsFromDB.map(faq => ({
        _id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer
      }));
      await Promise.all(englishFaqs.map(faq => {
        return setToCache("en", faq._id, JSON.stringify(faq));
      }));
      return res.json(englishFaqs);
    }

    let translatedCache = await getAllFromCache(lang);
    if (translatedCache && Object.keys(translatedCache).length > 0) {
      return res.json(Object.values(translatedCache));
    }

    let englishCache = await getAllFromCache("en");
    let englishFaqs;

    if (englishCache && Object.keys(englishCache).length > 0) {
      englishFaqs = Object.values(englishCache);
    } else {
      const faqsFromDB = await FAQ.find();
      englishFaqs = faqsFromDB.map(faq => ({
        _id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer
      }));
      await Promise.all(englishFaqs.map(faq => {
        return setToCache("en", faq._id, JSON.stringify(faq));
      }));
    }

    const translatedFaqs = await Promise.all(englishFaqs.map(async (faq) => {
      const [translatedQuestion, translatedAnswer] = await Promise.all([
        translateText(faq.question, lang).catch(() => faq.question),
        translateText(faq.answer, lang).catch(() => faq.answer)
      ]);

      return {
        _id: faq._id.toString(),
        question: translatedQuestion,
        answer: translatedAnswer
      };
    }));

    await Promise.all(translatedFaqs.map(faq => {
      return setToCache(lang, faq._id, JSON.stringify(faq));
    }));

    return res.json(translatedFaqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ error: "Server error" });
  }
}


// Add new FAQ
export async function addFAQ(req, res) {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const newFAQ = new FAQ({question, answer});

    await newFAQ.save();

    const faqId = newFAQ._id.toString();
    const faqValue = JSON.stringify({_id:faqId, question, answer});
    setToCache("en", faqId, faqValue);


    res.status(201).json({
      _id: newFAQ._id,
      question: newFAQ.question,
      answer: newFAQ.answer
    });

  } catch (err) {
    console.error("Error adding FAQ:", err);
    res.status(500).json({ 
      error: "Error adding FAQ",
      details: err.message
    });
  }
}

// Update FAQ
export async function updateFAQ(req, res) {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.translations = {};
    await faq.save();

    const languages = await getCachedLanguages();
    console.log("Languages in Redis: ", languages);

    await Promise.all(
      languages.map(async (lang) => {
        if(lang === "en"){
          await setToCache("en", id, JSON.stringify({_id:id, question: faq.question, answer: faq.answer}));
        }
        else{
          const [translatedQuestion, translatedAnswer] = await Promise.all([
            translateText(faq.question, lang).catch(() => faq.question),
            translateText(faq.answer, lang).catch(() => faq.answer),
          ]);

          await setToCache(lang, id, JSON.stringify({_id:id, question: translatedQuestion, answer: translatedAnswer}));
        }

        await refreshCacheTTL(lang);
      })
    )

    res.json(faq);
  } catch (err) {
    console.error("Error updating FAQ: ", err);
    res.status(500).json({ error: "Error updating FAQ" });
  }
}


// Delete FAQ
export async function deleteFAQ(req, res) {
  try {
    const { id } = req.params;
    // console.log("Deleting FAQ with ID:", id);

    // Delete from MongoDB
    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    // Get all languages stored in Redis
    const languages = await getCachedLanguages();
    console.log("Languages in Redis before deletion:", languages);

    // Delete the FAQ from Redis for all languages
    await Promise.all(
      languages.map(async (lang) => {
        await deleteFromCache(lang, id);
        await refreshCacheTTL(lang); // Refresh TTL after deletion
      })
    );

    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    res.status(500).json({ error: "Error deleting FAQ" });
  }
}

