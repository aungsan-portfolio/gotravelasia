export type Language = "en" | "my";

export interface Translations {
    [key: string]: string;
}

export const translations: Record<Language, Translations> = {
    en: {
        // Navigation & Header
        home: "Home",
        flights: "Flights",
        hotels: "Hotels",
        tours: "Tours",
        transfers: "Transfers",
        esim: "eSIM",
        insurance: "Insurance",

        // Hero & Slogan
        heroTitle: "Discover Thailand",
        slogan: "CRAFTING UNFORGETTABLE JOURNEYS",

        // Homepage sections
        travelingFromMyanmar: "Traveling from Myanmar?",
        featuredDestinations: "Featured Destinations",
        bookTransport: "Book Your Transport",
        gettingAround: "Getting Around Thailand",

        // Transport widget
        from: "From",
        to: "To",
        departureDate: "Departure Date",
        search: "Search",
        noSchedules: "No schedules found",
        duration: "Duration",
        price: "Price",
        bookNow: "Book Now",
        rating: "Rating",
        affiliateDisclosure: "Affiliate Link: We earn a small commission when you book through our links. This helps us provide free travel guides. Your price remains the same.",

        // Destinations
        bangkok: "Bangkok",
        chiangMai: "Chiang Mai",
        phuket: "Phuket",
        krabi: "Krabi",
        pai: "Pai",
        chiangRai: "Chiang Rai",

        // CTAs
        checkHotels: "Check Hotels",
        viewTours: "View Tours",
        bookThisTrip: "Book This Trip Now",
        planTrip: "Plan Trip",
        signIn: "Sign In",

        // Footer
        aboutUs: "About Us",
        contactUs: "Contact Us",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        subscribe: "Subscribe",
        newsletterTitle: "Stay Updated",
        newsletterDesc: "Join thousands of travelers getting the best Thailand travel tips and deals.",
        enterEmail: "Enter your email address",

        // Common
        learnMore: "Learn More",
        viewAll: "View All",
        readMore: "Read More",
    },
    my: {
        // Navigation & Header
        home: "ပင်မစာမျက်နှာ",
        flights: "လေယာဉ်လက်မှတ်များ",
        hotels: "ဟိုတယ်များ",
        tours: "ခရီးစဉ်များ",
        transfers: "လေဆိပ်ပို့ဆောင်ရေး",
        esim: "eSIM",
        insurance: "ခရီးသွားအာမခံ",

        // Hero & Slogan
        heroTitle: "ထိုင်းနိုင်ငံကို ရှာဖွေပါ",
        slogan: "မမေ့နိုင်သော ခရီးစဉ်များကို ဖန်တီးပေးခြင်း",

        // Homepage sections
        travelingFromMyanmar: "မြန်မာနိုင်ငံမှ ခရီးထွက်ပါသလား။",
        featuredDestinations: "ထင်ရှားသော ခရီးနေရာများ",
        bookTransport: "သယ်ယူပို့ဆောင်ရေး ကြိုတင်မှာယူပါ",
        gettingAround: "ထိုင်းနိုင်ငံတွင် သွားလာရေး",

        // Transport widget
        from: "မှ",
        to: "သို့",
        departureDate: "ထွက်ခွာမည့်ရက်",
        search: "ရှာဖွေပါ",
        noSchedules: "ခရီးစဉ်များ မတွေ့ပါ",
        duration: "ကြာချိန်",
        price: "ဈေးနှုန်း",
        bookNow: "ယခုကြိုတင်မှာယူပါ",
        rating: "အဆင့်သတ်မှတ်ချက်",
        affiliateDisclosure: "ကိုယ်ပိုင်လင့်ခ်။ သင်ဤလင့်ခ်များမှတစ်ဆင့် ကြိုတင်မှာယူပါက ကျွန်ုပ်တို့အား ကော်မရှင်အနည်းငယ်ရရှိပါသည်။ ဤအရာက ကျွန်ုပ်တို့အား အခမဲ့ခရီးလမ်းညွှန်များ ပေးနိုင်ရန် ကူညီပေးပါသည်။ သင်၏ဈေးနှုန်းမှာ ပုံမှန်အတိုင်းပင်ဖြစ်ပါသည်။",

        // Destinations
        bangkok: "ဘန်ကောက်",
        chiangMai: "ချင်းမိုင်",
        phuket: "ပူးကက်",
        krabi: "ကရာဘီ",
        pai: "ပိုင်",
        chiangRai: "ချင်းရိုင်",

        // CTAs
        checkHotels: "ဟိုတယ်ရှာပါ",
        viewTours: "ခရီးစဉ်များကြည့်ပါ",
        bookThisTrip: "ဤခရီးကို ယခုမှာယူပါ",
        planTrip: "ခရီးစီစဉ်ပါ",
        signIn: "ဝင်ရောက်ပါ",

        // Footer
        aboutUs: "ကျွန်ုပ်တို့အကြောင်း",
        contactUs: "ဆက်သွယ်ရန်",
        privacyPolicy: "ကိုယ်ရေးအချက်အလက်မူဝါဒ",
        termsOfService: "ဝန်ဆောင်မှုစည်းကမ်းများ",
        subscribe: "စာရင်းသွင်းပါ",
        newsletterTitle: "နောက်ဆုံးရသတင်းများရယူပါ",
        newsletterDesc: "ထိုင်းခရီးသွားအကြံပြုချက်များနှင့် အထူးလျှော့စျေးများကို ရယူပါ။",
        enterEmail: "သင့်အီးမေးလ်ထည့်ပါ",

        // Common
        learnMore: "ပိုမိုလေ့လာပါ",
        viewAll: "အားလုံးကြည့်ပါ",
        readMore: "ဆက်ဖတ်ပါ",
    },
};
