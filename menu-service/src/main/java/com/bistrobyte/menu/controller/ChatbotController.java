package com.bistrobyte.menu.controller;

import com.bistrobyte.menu.entity.MenuItem;
import com.bistrobyte.menu.entity.Restaurant;
import com.bistrobyte.menu.repository.MenuItemRepository;
import com.bistrobyte.menu.repository.RestaurantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin("*")
public class ChatbotController {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final Random random = new Random();

    public ChatbotController(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> queryBot(@RequestBody(required = false) Map<String, Object> payload) {
        if (payload == null) {
            payload = Collections.emptyMap();
        }

        Object queryObj = payload.get("query");
        String rawQuery = queryObj != null ? queryObj.toString().trim() : "";

        Object langObj = payload.get("language");
        String requestedLang = langObj != null ? langObj.toString().toLowerCase() : "en";

        Object tasteObj = payload.get("tastePreference");
        String tastePreference = tasteObj != null ? tasteObj.toString() : "";

        Object spiceObj = payload.get("spiceLevel");
        String spiceLevel = spiceObj != null ? spiceObj.toString() : "";

        Object foodObj = payload.get("foodPreference");
        String foodPreference = foodObj != null ? foodObj.toString() : "";

        String lowerQuery = rawQuery.toLowerCase();
        Map<String, Object> response = new LinkedHashMap<>();

        // Detect language dynamically from query or user setting
        String lang = detectLanguage(lowerQuery, requestedLang);
        String currentMealPeriod = getCurrentMealPeriod();

        // 1. ORDER TRACKING INTENT
        if (matchesPattern(lowerQuery, "track", "order status", "where is my order", "na order ekkada",
                "mera order kahan hai", "order tracking", "track my order", "order status enti", "kahan pahuncha")) {
            response.put("type", "action");
            response.put("action", "NAVIGATE_ORDERS");
            response.put("message", getLocalizedMessage(lang,
                    "Checking your live orders right now. Taking you to the live kitchen & delivery tracking page! 🚀",
                    "మీ లైవ్ ఆర్డర్ స్టేటస్ తనిఖీ చేస్తున్నాను. వెంటనే లైవ్ కిచెన్ ట్రాకింగ్ పేజీకి తీసుకెళ్తున్నాను! 🚀",
                    "आपके लाइव ऑर्डर की स्थिति जांची जा रही है। चलिए तुरंत लाइव ट्रैकिंग पेज पर चलते हैं! 🚀",
                    "உங்கள் நேரலை ஆர்டர் நிலையை சரிபார்க்கிறேன். நேரலை கண்காணிப்பு பக்கத்திற்கு செல்கிறோம்! 🚀"));
            return ResponseEntity.ok(response);
        }

        // 2. ADD TO CART INTENT (e.g. "Add dosa to cart", "Naku biryani kavali", "Ek paneer chahiye")
        boolean isAddIntent = (lowerQuery.contains("add ") || lowerQuery.contains("order ") || lowerQuery.contains("kavali")
                || lowerQuery.contains("chahiye") || lowerQuery.contains("venum"))
                && !lowerQuery.contains("order status") && !lowerQuery.contains("track") && !lowerQuery.contains("ekkada");

        if (isAddIntent) {
            List<MenuItem> all = menuItemRepository.findByIsAvailableTrue();
            for (MenuItem item : all) {
                if (item.getName() == null) continue;
                String itemNameLower = item.getName().toLowerCase();
                String[] words = itemNameLower.split("\\s+");
                boolean matched = lowerQuery.contains(itemNameLower);
                if (!matched) {
                    for (String w : words) {
                        if (w.length() > 3 && lowerQuery.contains(w)) {
                            matched = true;
                            break;
                        }
                    }
                }
                if (matched) {
                    response.put("type", "action");
                    response.put("action", "ADD_TO_CART");
                    response.put("item", item);
                    response.put("message", getLocalizedMessage(lang,
                            "Added delicious " + item.getName() + " (₹" + item.getPrice() + ") to your cart! Ready to checkout whenever you are. 🛒",
                            item.getName() + " (₹" + item.getPrice() + ") మీ కార్ట్‌కి విజయవంతంగా జోడించబడింది! ఆర్డర్ చేయడానికి రెడీగా ఉంది. 🛒",
                            item.getName() + " (₹" + item.getPrice() + ") आपके कार्ट में जोड़ दिया गया है! जब चाहें चेकआउट करें। 🛒",
                            item.getName() + " (₹" + item.getPrice() + ") உங்கள் கூடையில் சேர்க்கப்பட்டது! 🛒"));
                    return ResponseEntity.ok(response);
                }
            }
        }

        // 3. GRATITUDE / COURTESY (Checked early so 'thank you' is not mistaken for 'yo' or 'hi')
        if (matchesPattern(lowerQuery, "thank you", "thanks", "dhanyavadalu", "shukriya", "nandri",
                "great", "super", "bagundi", "badiya", "mast", "awesome")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "You're most welcome! Enjoy every single bite with BistroByte! ✨ Let me know if you need anything else.",
                    "చాలా సంతోషం! బిస్ట్రోబైట్ రుచులను హాయిగా ఆస్వాదించండి! ✨ మళ్ళీ ఎప్పుడు కావాలన్నా నన్ను పిలవండి.",
                    "आपका बहुत-बहुत स्वागत है! बिस्ट्रोबाइट के साथ अपने भोजन का पूरा आनंद लीजिये! ✨ कोई और सेवा हो तो बताइएगा।",
                    "மிக்க நன்றி! பிஸ்ட்ரோபைட் உணவை மகிழ்ச்சியாக அனுபவியுங்கள்! ✨"));
            return ResponseEntity.ok(response);
        }

        // 4. SMALL TALK / "NOTHING" / CASUAL / BORED INTENT
        if (matchesPattern(lowerQuery, "nothing", "nothing much", "just looking", "just browsing", "bore",
                "bore kottiddi", "bore kodtundi", "bore ho raha", "kuch nahi", "kuch nhi", "em ledu", "emledu",
                "not now", "em le", "khali", "chill", "timepass", "later", "no thanks", "nah", "nope", "onnum illa")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    pickRandom(
                            "No problem at all! 😊 Take your time and explore freely. Whenever you get hungry or crave something hot and spicy, I'm right here. Anything you'd like to try later?",
                            "Totally understand! Relax and browse. If your tummy starts rumbling, just say the word and I'll find the best chef specials around you! ✨",
                            "All good! No rush. We have freshly made Biryanis, hot Tiffins, and rich desserts whenever you feel like having a bite. What is your all-time favorite dish?"
                    ),
                    pickRandom(
                            "సరేనండి, ఏమీ పర్వాలేదు! 😊 మీరు ప్రశాంతంగా చూడండి. మీకు ఎప్పుడు ఆకలి వేసినా లేదా ఘుమఘుమలాడే బిర్యానీ, వేడి టిఫిన్ తినాలనిపించినా వెంటనే చెప్పండి!",
                            "పర్వాలేదండి! మీకు బోర్ కొడితే లేదా ఏదైనా క్రేవింగ్ వస్తే నన్ను అడగండి, అద్భుతమైన స్పైసీ ఫుడ్స్ సజెస్ట్ చేస్తాను! ✨",
                            "ఏం పర్లేదు! మీకు ఇష్టమైనప్పుడు చెప్పండి, వేడివేడి నెయ్యి దోశలు లేదా బిర్యానీ ఆర్డర్ చేద్దాం!"
                    ),
                    pickRandom(
                            "अरे बिल्कुल कोई बात नहीं! 😊 आप आराम से देखिये। जब भी कुछ चटपटा, गरमा-गरम या मीठा खाने की इच्छा हो, मुझे जरूर बताइएगा!",
                            "कोई बात नहीं जी! जब भी भूख लगे या मन करे कुछ स्पेशल खाने का, BistroBot हमेशा हाजिर है! ✨",
                            "बिल्कुल ठीक! जब भी आपका मन बने, बताइएगा — गरमा-गरम हैदराबादी बिरयानी और डोसा हमेशा तैयार हैं।"
                    ),
                    "சரிங்க, பரவாயில்லை! 😊 நிதானமாக பாருங்கள். எப்போது பசி எடுத்தாலும் அல்லது ருசியான உணவு சாப்பிட நினைத்தாலும் சொல்லுங்கள்!"
            ));
            return ResponseEntity.ok(response);
        }

        // 5. HOW ARE YOU / WELLBEING
        if (matchesPattern(lowerQuery, "how are you", "how r u", "ela unnav", "bagunnava", "bavunnava",
                "kaise ho", "kaisa hai", "kya haal hai", "eppadi irukinga", "eppadi irukkeenga", "sab theek", "kya chal raha", "enti visheshalu")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "I'm doing wonderful, thank you for asking! 👨‍🍳 Our partner kitchens are buzzing with fresh aromas and fast deliveries today. How are you doing? Ready for a delicious meal?",
                    "నేను చాలా బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! 👨‍🍳 మా కిచెన్ చెఫ్స్ అన్నీ సిద్ధం చేసి ఉంచారు. మీరు ఎలా ఉన్నారు? ఈరోజు ఏమైనా స్పెషల్ తిందామా?",
                    "मैं बिल्कुल बढ़िया हूँ, आपका धन्यवाद! 👨‍🍳 हमारी रसोई में आज बेहतरीन व्यंजन तैयार हो रहे हैं। आप कैसे हैं? आज कुछ लजीज खाने का इरादा है?",
                    "நான் நலமாக உள்ளேன், நன்றி! 👨‍🍳 இன்று என்ன சிறப்பு உணவு சாப்பிட விரும்புகிறீர்கள்?"));
            return ResponseEntity.ok(response);
        }

        // 6. IDENTITY / WHO ARE YOU / CAPABILITIES
        if (matchesPattern(lowerQuery, "who are you", "who r u", "what is your name", "nuvvu evaru",
                "tum kaun ho", "ne peru enti", "tera naam kya", "what can you do", "who made you", "help me",
                "what is bistrobyte", "bistrobyte enti", "bistrobyte kya hai", "about bistrobyte")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "I am BistroBot 🤖, your smart AI dining assistant for BistroByte Hospitality! You can chat freely with me in English, Telugu, Hindi, or Tamil. I can recommend chef specials, discover nearby restaurants, add food directly to your cart, or track your live kitchen orders.",
                    "నేను బిస్ట్రోబాట్ (BistroBot) 🤖! మీరు నాతో తెలుగు, హిందీ లేదా ఇంగ్లీషులో స్వేచ్ఛగా చాట్ చేయవచ్చు. మీకు నచ్చిన వంటకాలు చూపించడం, సమీపంలోని హోటల్స్ కనుగొనడం మరియు ఆర్డర్ ట్రాకింగ్‌లో నేను సహాయపడతాను.",
                    "मैं BistroBot हूँ 🤖! आप मुझसे हिंदी, हिंग्लिश, तेलुगु या अंग्रेजी में बेझिझक बात कर सकते हैं। मैं आपको बेहतरीन खाने के विकल्प ढूंढने, कार्ट में जोड़ने और लाइव ऑर्डर ट्रैक करने में मदद करता हूँ।",
                    "நான் BistroBot 🤖! உங்கள் AI உணவு உதவியாளர். நீங்கள் என்னுடன் தமிழில் பேசலாம்!"));
            return ResponseEntity.ok(response);
        }

        // 7. BOT / AI / HUMAN IDENTITY QUESTION
        if (matchesPattern(lowerQuery, "are you human", "are you ai", "are you a bot", "are you real", "bot aa", "robot aa", "human aa")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "I am an AI assistant built specifically for BistroByte Hospitality! 🤖 While I don't eat food myself, I know everything about great taste, live kitchen prep, and swift delivery. What are you craving today?",
                    "నేను బిస్ట్రోబైట్ యొక్క AI ఫుడ్ అసిస్టెంట్‌ని! 🤖 నాకు ఆకలి వేయకపోయినా, మీకు ఎక్కడ ఉత్తమమైన రుచికరమైన ఆహారం లభిస్తుందో ఖచ్చితంగా చెప్పగలను. ఈరోజు ఏం ఆర్డర్ చేద్దాం?",
                    "मैं बिस्ट्रोबाइट का एक एआई असिस्टेंट हूँ! 🤖 हालांकि मैं खुद खाना नहीं खाता, लेकिन आपके लिए सबसे स्वादिष्ट खाना ढूंढने में मुझे महारत हासिल है। बताइए, आज क्या पसंद करेंगे?",
                    "நான் பிஸ்ட்ரோபைட்டின் AI உதவியாளர்! 🤖 சுவையான உணவை தேர்ந்தெடுக்க உங்களுக்கு உதவுகிறேன்."));
            return ResponseEntity.ok(response);
        }

        // 8. DELIVERY / CAMPUS / HOSTEL QUESTIONS
        if (matchesPattern(lowerQuery, "hostel", "delivery", "gate", "campus", "how long", "time padtundi", "kab aayega", "kitna time", "delivery fee")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "Our delivery team brings fresh, hot meals straight to your campus gate, hostel, or doorstep in typically 25 to 35 minutes! 🚀 Delivery fee is minimal or completely free on qualifying orders.",
                    "మా డెలివరీ పార్ట్‌నర్లు మీ క్యాంపస్ గేట్, హాస్టల్ లేదా ఇంటి వద్దకు వేడివేడిగా కేవలం 25 నుండి 35 నిమిషాల్లో ఆహారాన్ని అందిస్తారు! 🚀",
                    "हमारी डिलीवरी टीम आपके हॉस्टल, कैंपस गेट या घर पर 25 से 35 मिनट में गरमा-गरम खाना पहुंचा देती है! 🚀",
                    "உங்கள் இடத்திற்கே 25 முதல் 35 நிமிடங்களில் சுடச்சுட டெலிவரி செய்கிறோம்! 🚀"));
            return ResponseEntity.ok(response);
        }

        // 9. PAYMENT OPTIONS QUESTIONS
        if (matchesPattern(lowerQuery, "payment", "how to pay", "upi", "google pay", "phonepe", "cash", "cod", "pay", "ela pay", "kaise pay")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "BistroByte supports instant UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD) at checkout! 💳⚡",
                    "బిస్ట్రోబైట్ లో తక్షణ UPI (Google Pay, PhonePe, Paytm), క్రెడిట్/డెబిట్ కార్డులు మరియు క్యాష్ ఆన్ డెలివరీ (COD) ద్వారా సులభంగా చెల్లించవచ్చు! 💳⚡",
                    "आप यूपीआई (Google Pay, PhonePe), कार्ड, नेट बैंकिंग या कैश ऑन डिलीवरी (COD) से आसानी से भुगतान कर सकते हैं! 💳⚡",
                    "UPI, கார்டு மற்றும் Cash on Delivery (COD) மூலம் எளிதாக பணம் செலுத்தலாம்! 💳⚡"));
            return ResponseEntity.ok(response);
        }

        // 10. GREETINGS & CASUAL HELLO
        if (matchesPattern(lowerQuery, "hi", "hello", "hey", "yo", "sup", "namaste", "namaskaram",
                "namaskara", "vanakkam", "good morning", "good evening", "good afternoon", "subhodayam", "shubh din")) {
            response.put("type", "text");
            response.put("message", getLocalizedGreeting(lang, currentMealPeriod));
            return ResponseEntity.ok(response);
        }

        // 11. FAREWELL
        if (matchesPattern(lowerQuery, "bye", "good night", "goodnight", "tata", "see you",
                "padukuntunna", "sona hai", "tathastu")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "Goodbye! Have a restful time, and see you next time you crave great food! 👋",
                    "వీడ్కోలు! మీ సమయం శుభంగా గడవాలని కోరుకుంటున్నాను. మళ్ళీ ఆకలి వేసినప్పుడు కలుద్దాం! 👋",
                    "अलविदा! आपका समय शुभ हो। फिर मिलेंगे जब भूख लगेगी! 👋",
                    "போய் வருகிறேன்! மீண்டும் சந்திப்போம்! 👋"));
            return ResponseEntity.ok(response);
        }

        // 12. JOKES / FUN
        if (matchesPattern(lowerQuery, "joke", "jokes", "fun", "cheppu joke", "hasao", "chutkula")) {
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "Why did the tomato blush? Because it saw the salad dressing! 😂 Now, ready to dress your appetite with some real food?",
                    "దోశ కి ప్యాంట్ ఎందుకు ఉండదు? ఎందుకంటే దానికి రోల్ ఉండడం అలవాటు! 😂 సరదా కాసేపు పక్కన పెట్టి, వేడివేడి మసాలా దోశ ఆర్డర్ చేద్దామా?",
                    "समोसे ने आलू से क्या कहा? जब तक रहेगा समोसे में आलू, तब तक रहेगा बिस्ट्रोबाइट का स्वाद! 😂 क्या कुछ गरमा-गरम नाश्ता मंगाया जाए?",
                    "ஒரு தக்காளி ஏன் வெட்கப்பட்டது? சாலட் டிரஸ்ஸிங்கை பார்த்ததால்! 😂 இப்போது சுவையான உணவு சாப்பிடலாமா?"));
            return ResponseEntity.ok(response);
        }

        // 13. HUNGER / CRAVINGS / FOOD ADVICE
        if (matchesPattern(lowerQuery, "hungry", "hunger", "aakali", "aakalesthundi", "chala aakali",
                "bhookh", "bhookh lagi", "kuch khana", "suggest food", "what should i eat", "em tinali",
                "kya khau", "recommend", "best dish", "kavalanipistundi", "craving")) {
            List<MenuItem> topDishes = menuItemRepository.findByIsAvailableTrue().stream().limit(4).toList();
            response.put("type", "food_cards");
            response.put("items", topDishes);
            response.put("message", getLocalizedMessage(lang,
                    "Feeling hungry? I've got the perfect remedy! 🍛 Here are chef top picks hot and fresh right now:",
                    "ఆకలిగా ఉందా? మీ ఆకలికి సరిపోయే అదిరిపోయే వంటకాలు ఇవిగో! 🍛 ఘుమఘుమలాడే బిర్యానీ మరియు స్పెషల్స్ చూడండి:",
                    "भूख लगी है? चिंता मत कीजिये! 🍛 यहाँ रसोई से गरमा-गरम और लजीज व्यंजन आपके लिए तैयार हैं:",
                    "பசிக்கிறதா? உங்களுக்காக சுவையான உணவு வகைகள் இதோ! 🍛"));
            return ResponseEntity.ok(response);
        }

        // 14. SWEETS / DESSERTS
        if (matchesPattern(lowerQuery, "sweet", "sweets", "meetha", "dessert", "gulab jamun", "ice cream",
                "halwa", "payasam", "mithai")) {
            List<MenuItem> desserts = menuItemRepository.findByCategory("Desserts");
            if (desserts.isEmpty()) desserts = menuItemRepository.findByCategory("Dessert");
            if (desserts.isEmpty()) desserts = menuItemRepository.findByIsAvailableTrue().stream().limit(3).toList();

            response.put("type", "food_cards");
            response.put("items", desserts);
            response.put("message", getLocalizedMessage(lang,
                    "Got a sweet tooth? 🍨 Here are delightful desserts to sweeten your moments:",
                    "నోరు తీపి చేసుకోవాలని ఉందా? 🍨 మీ భోజనాన్ని పరిపూర్ణం చేసే నోరూరించే స్వీట్లు ఇవిగో:",
                    "कुछ मीठा हो जाए? 🍨 पेश हैं आज के सबसे स्वादिष्ट मीठे व्यंजन:",
                    "இனிப்பு சாப்பிட ஆசையா? 🍨 இதோ உங்களுக்கான சுவையான இனிப்புகள்:"));
            return ResponseEntity.ok(response);
        }

        // 15. DRINKS / COFFEE / CHAI
        if (matchesPattern(lowerQuery, "tea", "chai", "coffee", "filter coffee", "drink", "beverage", "cool drink", "lassi")) {
            List<MenuItem> drinks = menuItemRepository.findByCategory("Beverages");
            if (drinks.isEmpty()) drinks = menuItemRepository.findByCategory("Drinks");
            if (drinks.isEmpty()) drinks = menuItemRepository.findByIsAvailableTrue().stream().limit(3).toList();

            response.put("type", "food_cards");
            response.put("items", drinks);
            response.put("message", getLocalizedMessage(lang,
                    "Refreshing beverages and hot filter coffee, brewed to perfection: ☕",
                    "తాజా కాఫీ & రుచికరమైన పానీయాలు సిద్ధంగా ఉన్నాయి: ☕",
                    "ताजा फिल्टर कॉफी और ताजगी से भरे पेय यहाँ हैं: ☕",
                    "புத்துணர்ச்சியூட்டும் காபி மற்றும் பானங்கள் இதோ: ☕"));
            return ResponseEntity.ok(response);
        }

        // 16. TIFFIN & BREAKFAST
        if (matchesPattern(lowerQuery, "tiffin", "breakfast", "dosa", "idli", "vada", "upma", "poori", "plan")) {
            List<MenuItem> tiffins = menuItemRepository.findByMealType("Tiffin");
            if (tiffins.isEmpty()) tiffins = menuItemRepository.findByCategory("Starters");
            if (tiffins.isEmpty()) tiffins = menuItemRepository.findByIsAvailableTrue().stream().limit(4).toList();

            response.put("type", "food_cards");
            response.put("items", tiffins);
            response.put("message", getLocalizedMessage(lang,
                    "Here are fresh Tiffin & Breakfast options prepared live with pure ghee and homemade chutneys:",
                    "ఇక్కడ తాజా టిఫిన్ & బ్రేక్‌ఫాస్ట్ రకాలు ఉన్నాయి. స్వచ్ఛమైన నెయ్యి మరియు రుచికరమైన చట్నీలతో సిద్ధం చేయబడ్డాయి:",
                    "यहाँ ताज़ा टिफिन और नाश्ते के बेहतरीन विकल्प हैं:",
                    "சுடச்சுட டிபன் மற்றும் காலை உணவு வகைகள் இதோ:"));
            return ResponseEntity.ok(response);
        }

        // 17. RESTAURANT SEARCH (e.g. "Which restaurants are open?", "Restaurants near me")
        if (matchesPattern(lowerQuery, "restaurant", "hotel", "dhabha", "open now", "near me", "places")) {
            List<Restaurant> openRests = restaurantRepository.findAll().stream()
                    .filter(r -> Boolean.TRUE.equals(r.getIsOpen()))
                    .limit(5)
                    .toList();

            response.put("type", "restaurants");
            response.put("restaurants", openRests);
            response.put("message", getLocalizedMessage(lang,
                    "Here are verified BistroByte partner restaurants open right now around your area:",
                    "మీ ప్రాంతంలో ప్రస్తుతం ఆర్డర్లు స్వీకరిస్తున్న బిస్ట్రోబైట్ భాగస్వామ్య రెస్టారెంట్లు ఇవిగో:",
                    "आपके क्षेत्र में अभी खुले सत्यापित बिस्ट्रोबाइट पार्टनर रेस्तरां ये रहे:",
                    "உங்கள் பகுதியில் இப்போது திறந்திருக்கும் உணவகங்கள் இதோ:"));
            return ResponseEntity.ok(response);
        }

        // 18. TASTE / SPICE / DIETARY / KEYWORD SEARCH OVER MENU
        List<MenuItem> allAvailable = menuItemRepository.findByIsAvailableTrue();
        List<MenuItem> filtered = allAvailable.stream().filter(item -> {
            boolean match = false;
            String itemName = item.getName() != null ? item.getName().toLowerCase() : "";
            String itemDesc = item.getDescription() != null ? item.getDescription().toLowerCase() : "";
            String itemCat = item.getCategory() != null ? item.getCategory().toLowerCase() : "";

            // Spicy filter
            if (lowerQuery.contains("spicy") || lowerQuery.contains("karam") || lowerQuery.contains("teekha")) {
                if (item.getSpicyLevel() != null && item.getSpicyLevel() >= 1) match = true;
                if (!match) return false;
            }

            // Veg filter
            if (lowerQuery.contains("veg") && !lowerQuery.contains("non-veg")) {
                if (!"Veg".equalsIgnoreCase(item.getDietaryType()) && !"Vegan".equalsIgnoreCase(item.getDietaryType())) return false;
                match = true;
            }

            // Non-Veg filter
            if (lowerQuery.contains("non-veg") || lowerQuery.contains("chicken") || lowerQuery.contains("mutton") || lowerQuery.contains("meat")) {
                if (!"Non-Veg".equalsIgnoreCase(item.getDietaryType())) return false;
                match = true;
            }

            // Cuisine match
            if (lowerQuery.contains("andhra") || lowerQuery.contains("south indian")) {
                if (item.getCuisineType() != null && (item.getCuisineType().toLowerCase().contains("andhra") || item.getCuisineType().toLowerCase().contains("south"))) {
                    match = true;
                }
            }

            // Price budget filter (Fixed for Rupee scale)
            if (lowerQuery.contains("under 100")) {
                if (item.getPrice() != null && item.getPrice() > 100.0) return false;
                match = true;
            } else if (lowerQuery.contains("under 200") || lowerQuery.contains("budget")) {
                if (item.getPrice() != null && item.getPrice() > 200.0) return false;
                match = true;
            } else if (lowerQuery.contains("under 300")) {
                if (item.getPrice() != null && item.getPrice() > 300.0) return false;
                match = true;
            }

            // Multi-word keyword search
            if (!match && !lowerQuery.isBlank()) {
                if (itemName.contains(lowerQuery) || itemDesc.contains(lowerQuery) || itemCat.contains(lowerQuery)) {
                    match = true;
                } else {
                    for (String w : lowerQuery.split("\\s+")) {
                        if (w.length() > 3 && (itemName.contains(w) || itemDesc.contains(w) || itemCat.contains(w))) {
                            match = true;
                            break;
                        }
                    }
                }
            }

            return match;
        }).collect(Collectors.toList());

        if (!filtered.isEmpty()) {
            response.put("type", "food_cards");
            response.put("items", filtered.stream().limit(5).collect(Collectors.toList()));
            response.put("message", getLocalizedMessage(lang,
                    "Here are dishes matching your taste and preferences:",
                    "మీ అభిరుచికి అనుగుణంగా ఎంపిక చేయబడిన వంటకాలు ఇవిగో:",
                    "आपकी पसंद और स्वाद के अनुसार चुने गए व्यंजन ये रहे:",
                    "உங்கள் விருப்பத்திற்கு ஏற்ற உணவுகள் இதோ:"));
            return ResponseEntity.ok(response);
        }

        // 19. CONVERSATIONAL FALLBACK
        // If the query is related to food or eating, suggest current meal dishes
        boolean queryIsFoodRelated = matchesPattern(lowerQuery, "food", "dish", "curry", "rice", "item", "meal",
                "menu", "eat", "eating", "taste", "khana", "tinali", "bhojanam", "recipe", "specials", "recommend");

        if (queryIsFoodRelated) {
            List<MenuItem> mealItems = menuItemRepository.findByMealType(currentMealPeriod);
            if (mealItems.isEmpty()) mealItems = allAvailable.stream().limit(3).toList();

            response.put("type", "food_cards");
            response.put("items", mealItems);
            response.put("message", getLocalizedMessage(lang,
                    "Here are some of our chef's freshly prepared " + currentMealPeriod + " specials you will love:",
                    "ఈ సమయానికి మా చెఫ్ తాజా " + currentMealPeriod + " ప్రత్యేక వంటకాలు ఇవిగో:",
                    "यहाँ आज के " + currentMealPeriod + " के लोकप्रिय और ताज़ा व्यंजन आपके लिए हैं:",
                    "இன்றைய சிறப்பு " + currentMealPeriod + " உணவு வகைகள் இதோ:"));
        } else {
            // General conversational open chat
            response.put("type", "text");
            response.put("message", getLocalizedMessage(lang,
                    "I love chatting with you! 😊 While my superpower is being BistroByte's AI culinary assistant — finding delicious dishes, live kitchen tracking, and table reservations — I'm always here for good conversation. Are you in the mood for a quick snack or a full meal?",
                    "మీతో మాట్లాడటం చాలా బాగుంది! 😊 నేను ప్రధానంగా బిస్ట్రోబైట్ యొక్క AI ఫుడ్ అసిస్టెంట్‌ని — మీకు నోరూరించే వంటకాలు, రెస్టారెంట్లు మరియు ఆర్డర్ ట్రాకింగ్‌లో సహాయపడతాను. ప్రస్తుతం మీకు ఏమైనా రుచికరమైన ఫుడ్ తినాలనిపిస్తుందా?",
                    "आपसे बात करके बहुत अच्छा लगा! 😊 मैं मुख्य रूप से बिस्ट्रोबाइट का एआई फूड विशेषज्ञ हूँ — लजीज व्यंजन ढूंढने, रेस्टोरेंट देखने और लाइव ऑर्डर ट्रैक करने में आपकी मदद करता हूँ। क्या अभी कुछ खाने का मन है?",
                    "உங்களுடன் பேசுவதில் மகிழ்ச்சி! 😊 நான் பிஸ்ட்ரோபைட்டின் AI உணவு உதவியாளர். உங்களுக்கு ஏதாவது சுவையான உணவு சாப்பிட ஆசையா?"));
        }

        return ResponseEntity.ok(response);
    }

    private boolean matchesPattern(String text, String... patterns) {
        if (text == null || text.isBlank()) return false;
        for (String p : patterns) {
            String lowerP = p.toLowerCase().trim();
            if (lowerP.length() <= 3) {
                // Word boundary check for short words to avoid false positive substring matches
                if (text.matches("(?iu).*\\b" + Pattern.quote(lowerP) + "\\b.*")) {
                    return true;
                }
            } else {
                if (text.contains(lowerP)) return true;
            }
        }
        return false;
    }

    private String detectLanguage(String text, String defaultLang) {
        if (text == null) return defaultLang != null ? defaultLang : "en";

        // Telugu detection (script or transliterated keywords)
        if (text.matches(".*[\\u0C00-\\u0C7F]+.*") ||
                matchesPattern(text, "naku", "kavali", "ekkadundi", "tiffin", "eeroju", "chala",
                        "bagundi", "enti", "andhra", "bhojanam", "em ledu", "emledu", "aakali",
                        "cheppu", "ela unnav", "bavunnava", "tinocchu", "tinali", "edaina",
                        "kodtundi", "kottiddi", "undhi", "undi")) {
            return "te";
        }

        // Hindi detection (script or transliterated keywords)
        if (text.matches(".*[\\u0900-\\u097F]+.*") ||
                matchesPattern(text, "mujhe", "chahiye", "kahan", "khana", "kya", "bhookh",
                        "teekha", "shakahari", "kuch", "nahi", "kaisa", "kaise ho", "batao",
                        "bataiye", "acha", "accha", "chal raha", "meetha", "shukriya")) {
            return "hi";
        }

        // Tamil detection
        if (text.matches(".*[\\u0B80-\\u0BFF]+.*") ||
                matchesPattern(text, "enakku", "venum", "sappadu", "enge", "eppadi", "onnum illa", "vanakkam", "nandri")) {
            return "ta";
        }

        return defaultLang != null && !defaultLang.isBlank() ? defaultLang : "en";
    }

    private String getCurrentMealPeriod() {
        int hour = LocalTime.now().getHour();
        if (hour >= 6 && hour < 11) return "Tiffin";
        if (hour >= 11 && hour < 16) return "Lunch";
        if (hour >= 16 && hour < 19) return "Snacks";
        return "Dinner";
    }

    private String getLocalizedGreeting(String lang, String mealPeriod) {
        if ("te".equals(lang)) {
            return pickRandom(
                    "నమస్కారం! బిస్ట్రోబైట్‌కి స్వాగతం 🍽️ ఈరోజు ఘాటైన ఆంధ్ర భోజనం లేదా వేడివేడి టిఫిన్స్ కావాలా?",
                    "హలో! మీకు నచ్చిన రుచికరమైన వంటకాలు ఆర్డర్ చేయడానికి నేను సిద్ధంగా ఉన్నాను. ఏం తిందాం అనుకుంటున్నారు?",
                    "నమస్కారం! మీ కోసం వేడివేడి " + mealPeriod + " స్పెషల్స్ సిద్ధంగా ఉన్నాయి. ఏం ఆర్డర్ చేద్దాం?"
            );
        }
        if ("hi".equals(lang)) {
            return pickRandom(
                    "नमस्ते! बिस्ट्रोबाइट में आपका स्वागत है 🍽️ आज क्या खाने का विचार है — गरमा-गरम बिरयानी, डोसा या कुछ मीठा?",
                    "हेलो! आपके पसंदीदा व्यंजन और रेस्टोरेंट खोजने के लिए मैं तैयार हूँ। बताइए, आज क्या पसंद करेंगे?",
                    "नमस्ते! आज के " + mealPeriod + " का समय हो गया है। क्या कुछ खास और स्वादिष्ट खाने का मन है?"
            );
        }
        if ("ta".equals(lang)) {
            return "வணக்கம்! பிஸ்ட்ரோபைட் உங்களை வரவேற்கிறது 🍽️ இன்று என்ன சாப்பிட விரும்புகிறீர்கள்?";
        }
        // English Default
        return pickRandom(
                "Hey there! Welcome to BistroByte 🍽️ Craving something spicy, sweet, or comforting right now?",
                "Hello! Ready to discover delicious food near you? Tell me what you're in the mood for!",
                "Greetings! It's " + mealPeriod + " time 🌅. Let me help you find the best chef specials around you!"
        );
    }

    private String getLocalizedMessage(String lang, String en, String te, String hi, String ta) {
        if ("te".equals(lang)) return te;
        if ("hi".equals(lang)) return hi;
        if ("ta".equals(lang)) return ta;
        return en;
    }

    private String getLocalizedMessage(String lang, String en, String te, String hi) {
        return getLocalizedMessage(lang, en, te, hi, en);
    }

    private String pickRandom(String... options) {
        if (options == null || options.length == 0) return "";
        return options[random.nextInt(options.length)];
    }
}
