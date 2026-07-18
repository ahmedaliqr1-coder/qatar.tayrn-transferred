import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react";

const ALL_TITLES = {
  ar: [
    "السيد", "الآنسة", "الآنسة", "السيدة", "سيد", "الشيخة", "الشيخ", "الدكتور", "الأستاذ", 
    "العميد", "القائد", "العقيد", "اللواء", "الليدي", "الأمير", "الأميرة", "مدام", "لورد", 
    "صاحب السعادة", "الشريف/الشريفة", "صاحب السمو الملكي", "صاحبة السمو الملكي"
  ],
  en: [
    "Mr", "Miss", "Ms", "Mrs", "Mstr", "Sheikha", "Sheikh", "Dr", "Prof", "Brigadier", 
    "Captain", "Colonel", "Major General", "Lady", "Prince", "Princess", "Madam", "Lord", 
    "HE", "Sharif/Sharifa", "HRH", "HRH"
  ]
};

const ALL_RESIDENCE_COUNTRIES = {
  ar: [
    "جزر والس وفوتونا", "مدغشقر", "IC", "آيسلندا", "أثيوبيا", "أذربيجان", "أرمينيا", "أروبا", 
    "أستراليا", "أفغانستان", "ألبانيا", "ألمانيا", "أنتيغوا وبربودا", "أندورا", "أندونيسيا", 
    "أنغولا", "أورغواي", "أوزباكستان", "أوغندا", "أوكرانيا", "إريتريا", "إسبانيا", "إسرائيل", 
    "إلسلفادور", "إيران", "إيرلندا", "إيطاليا", "استونيا", "الأرجنتين", "الأردن", "الإكوادور", 
    "الإمارات العربيّة المتّحدة", "البحرين", "البرازيل", "البرتغال", "البوسنا والهرسك", 
    "الجبل الأسود", "الجزائر", "الجمهورية السلوفاكية", "الدانمارك", "السنغال", "السودان", 
    "السويد", "الصومال", "الصين", "العراق", "الغابون", "الفاتيكان", "الفليبين", "الكاميرون", 
    "الكويت", "المجر", "المغرب", "المكسيك", "المملكة العربية السعودية", "المملكة المتحدة", 
    "النرويج", "النمسا", "النيجر", "الهند", "الولايات المتحدة الأمريكية", "اليابان", "اليمن", 
    "اليونان", "بابوا غينيا الجديدة", "باراغواي", "باكستان", "بالاو", "باهاماس", "بربادوس", 
    "بروناي", "بلجيكا", "بلغاريا", "بليز", "بنغلاديش", "بنما", "بنين", "بوتان", "بوتسوانا", 
    "بورتو ريكو", "بوركينا فاسو", "بوروندي", "بولندا", "بوليفيا", "بولينيزيا الفرنسية", 
    "بيرو", "تايلندا", "تايوان, الصين", "تركس وكايكوس", "تركمانستان", "تركيا", "ترينيداد وتوباغو", 
    "تشاد", "تنزانيا", "توغو", "توفالو", "تونس", "تونغا", "تيمور ليست", "جبل طارق", "جرينلاند", 
    "جزر أنغويلا ليوارد", "جزر الرأس الأخضر", "جزر القمر", "جزر الكريماس", "جزر المالديف", 
    "جزر الولايات المتحدة الصغيرة النائية", "جزر برمودا", "جزر جوادلوب", "جزر سليمان", 
    "جزر فارو", "جزر فوكلاند", "جزر فيرجن الأمريكية", "جزر فيرجين البريطانية", "جزر كايمان", 
    "جزر كوك", "جزر كوكوس", "جزر مارشال", "جزر ماريانا الشمالية", "جزيرة نورفولك", "جمايكا", 
    "جمهورية أفريقيا الوسطى", "جمهورية التشيكية", "جمهورية الدومينيكان", "جمهورية الكونغو", 
    "جمهورية الكونغو الديمقراطية", "جمهورية صربيا", "جمهورية كوسوفو", "جنوب أفريقيا", 
    "جنوب السودان", "جوام", "جيبوتي", "جيورجيا", "خراساو", "دومينيكا", "رواندا", "روسيا الاتحادية", 
    "روسيا البيضاء", "رومانيا", "ريونيون", "زائير", "زامبيا", "زمبابوي", "ساحل العاج", "ساموا", 
    "ساموا الأمريكية", "سان تومي وبرينسيبي", "سان مارينو", "سانت بيير وميكلون", "سانت فنسنت وغرينادين", 
    "سانت كيتس ونيفس", "سانت لوسيا", "سانت مارتن", "سانت هيلينا", "سريلانكا", "سلطنة عمان", 
    "سلوفينيا", "سنغافورة", "سوازيلند", "سوريا", "سورينام", "سويسرا", "سيراليون", "سيشيل", 
    "شيلي", "طاجيكستان", "غامبيا", "غانا", "غرينادا", "غواتيمال", "غويانا الفرنسية", "غيانا", 
    "غينيا", "غينيا - بيساو", "غينيا الاستوائية", "فانواتو", "فرنسا", "فلسطين", "فنزويلا", 
    "فنلندا", "فيتنام", "فيجي", "قبرص", "قطر", "قيرغيزستان", "كازاخستان", "كاليدونيا الجديدة", 
    "كرواتيا", "كمبوديا", "كندا", "كوبا", "كوريا الجنوبية", "كوريا الشمالية", "كوستاريكا", 
    "كولومبيا", "كيريباتي", "كينيا", "لاتفيا", "لاوس", "لبنان", "لوكسمبورغ", "ليبيا", "ليبيريا", 
    "ليتوانيا", "ليختنشتين", "ليسوتو", "مارتينيك", "مالاوي", "مالطا", "مالي", "ماليزيا", 
    "مايكرونيزيا", "مصر", "مقدونيا الشمالية", "مكاو,  الصين", "منغوليا", "موريتانيا", "موريشيوس", 
    "موزمبيق", "مولدافيا", "موناكو", "مونتسيرات", "ميانمار", "ناميبيا", "نورو", "نيبال", "نيجيريا", 
    "نيكاراجوا", "نيوزيلندا", "نيوى", "هايتي", "هندوراس", "هولندا", "هونغ كونغ، الصين"
  ],
  en: [
    "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla Leeward Island", 
    "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", 
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
    "Bermuda", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil", "British Virgin Islands", 
    "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", 
    "Cape Verde Isl.", "Cayman Isl.", "Central African Republic", "Chad", "Chile", "China", 
    "Christmas Island", "Cocos (Keeling) Island", "Colombia", "Comoros", "Congo", "Congo Dem. Rep.", 
    "Cook Island", "Costa Rica", "Cote D Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", 
    "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Island", 
    "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "Gabon", 
    "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", 
    "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", 
    "Hong Kong, China", "Hungary", "IC", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
    "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North", 
    "Korea South", "Kuwait", "Kyrgyzstan", "Lao P.Dem.Rep.", "Latvia", "Lebanon", "Lesotho", 
    "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau,China", "Madagascar", 
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Island", "Martinique", "Mauritania", 
    "Mauritius", "Mexico", "Micronesia", "Minor U.S. Outlying Islands", "Moldova", "Monaco", 
    "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", 
    "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", 
    "Niue", "Norfolk Island", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", 
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", 
    "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of Kosova", "Reunion", "Romania", 
    "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Samoa", "San Marino", "Sao Tome And Principe", 
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovak Republic", 
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", 
    "St. Helena", "St. Lucia", "St. Maarten", "St. Pierre and Miquelon", "St. Vincent and Grenadines", 
    "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan, China", "Tajikistan", 
    "Tanzania", "Thailand", "Timor Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", 
    "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", 
    "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", 
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis and Futuna", "Yemen", "Zaire", 
    "Zambia", "Zimbabwe"
  ]
};

const ALL_PHONE_CODES = {
  ar: [
    "جزر والس وفوتونا (681)", "مدغشقر (261)", "IC (34)", "آيسلندا (354)", "أثيوبيا (251)", 
    "أذربيجان (994)", "أرمينيا (374)", "أروبا (297)", "أستراليا (61)", "أفغانستان (93)", 
    "ألبانيا (355)", "ألمانيا (49)", "أنتيغوا وبربودا (1)", "أندورا (376)", "أندونيسيا (62)", 
    "أنغولا (244)", "أورغواي (598)", "أوزباكستان (998)", "أوغندا (256)", "أوكرانيا (380)", 
    "إريتريا (291)", "إسبانيا (34)", "إسرائيل (972)", "إلسلفادور (503)", "إيران (98)", 
    "إيرلندا (353)", "إيطاليا (39)", "استونيا (372)", "الأرجنتين (54)", "الأردن (962)", 
    "الإكوادور (593)", "الإمارات العربيّة المتّحدة (971)", "البحرين (973)", "البرازيل (55)", 
    "البرتغال (351)", "البوسنا والهرسك (387)", "الجبل الأسود (382)", "الجزائر (213)", 
    "الجمهورية السلوفاكية (421)", "الدانمارك (45)", "السنغال (221)", "السودان (249)", 
    "السويد (46)", "الصومال (252)", "الصين (86)", "العراق (964)", "الغابون (241)", 
    "الفاتيكان (39)", "الفليبين (63)", "الكاميرون (237)", "الكويت (965)", "المجر (36)", 
    "المغرب (212)", "المكسيك (52)", "المملكة العربية السعودية (966)", "المملكة المتحدة (44)", 
    "النرويج (47)", "النمسا (43)", "النيجر (227)", "الهند (91)", "الولايات المتحدة الأمريكية (1)", 
    "اليابان (81)", "اليمن (967)", "اليونان (30)", "بابوا غينيا الجديدة (675)", "باراغواي (595)", 
    "باكستان (92)", "بالاو (680)", "باهاماس (242)", "بربادوس (1)", "بروناي (673)", "بلجيكا (32)", 
    "بلغاريا (359)", "بليز (501)", "بنغلاديش (880)", "بنما (507)", "بنين (229)", "بوتان (975)", 
    "بوتسوانا (267)", "بورتو ريكو (1)", "بوركينا فاسو (226)", "بوروندي (257)", "بولندا (48)", 
    "بوليفيا (591)", "بولينيزيا الفرنسية (689)", "بيرو (51)", "تايلندا (66)", "تايوان, الصين (886)", 
    "تركس وكايكوس (1)", "تركمانستان (993)", "تركيا (90)", "ترينيداد وتوباغو (1)", "تشاد (235)", 
    "تنزانيا (255)", "توغو (228)", "توفالو (688)", "تونس (216)", "تونغا (676)", "تيمور ليست (670)", 
    "جبل طارق (350)", "جرينلاند (299)", "جزر أنغويلا ليوارد (1)", "جزر الرأس الأخضر (238)", 
    "جزر القمر (269)", "جزر الكريماس (672)", "جزر المالديف (960)", "جزر الولايات المتحدة الصغيرة النائية (1)", 
    "جزر برمودا (1441)", "جزر جوادلوب (590)", "جزر سليمان (677)", "جزر فارو (298)", "جزر فوكلاند (500)", 
    "جزر فيرجن الأمريكية (1)", "جزر فيرجين البريطانية (1)", "جزر كايمان (1)", "جزر كوك (682)", 
    "جزر كوكوس (672)", "جزر مارشال (692)", "جزر ماريانا الشمالية (670)", "جزيرة نورفولك (6)", 
    "جمايكا (1)", "جمهورية أفريقيا الوسطى (236)", "جمهورية التشيكية (420)", "جمهورية الدومينيكان (1)", 
    "جمهورية الكونغو (242)", "جمهورية الكونغو الديمقراطية (243)", "جمهورية صربيا (381)", 
    "جمهورية كوسوفو (383)", "جنوب أفريقيا (27)", "جنوب السودان (211)", "جوام (671)", "جيبوتي (253)", 
    "جيورجيا (995)", "خراساو (599)", "دومينيكا (1)", "رواندا (250)", "روسيا الاتحادية (7)", 
    "روسيا البيضاء (375)", "رومانيا (40)", "ريونيون (262)", "زائير (243)", "زامبيا (260)", 
    "زمبابوي (263)", "ساحل العاج (225)", "ساموا (685)", "ساموا الأمريكية (684)", "سان تومي وبرينسيبي (239)", 
    "سان مارينو (378)", "سانت بيير وميكلون (508)", "سانت فنسنت وغرينادين (1)", "سانت كيتس ونيفس (1)", 
    "سانت لوسيا (758)", "سانت مارتن (721)", "سانت هيلينا (1)", "سريلانكا (94)", "سلطنة عمان (968)", 
    "سلوفينيا (386)", "سنغافورة (65)", "سوازيلند (268)", "سوريا (963)", "سورينام (597)", 
    "سويسرا (41)", "سيراليون (232)", "سيشيل (248)", "شيلي (56)", "طاجيكستان (992)", "غامبيا (220)", 
    "غانا (233)", "غرينادا (473)", "غواتيمال (502)", "غويانا الفرنسية (594)", "غيانا (592)", 
    "غينيا (224)", "غينيا - بيساو (245)", "غينيا الاستوائية (240)", "فانواتو (678)", "فرنسا (33)", 
    "فلسطين (970)", "فنزويلا (58)", "فنلندا (358)", "فيتنام (84)", "فيجي (679)", "قبرص (357)", 
    "قطر (974)", "قيرغيزستان (996)", "كازاخستان (7)", "كاليدونيا الجديدة (687)", "كرواتيا (385)", 
    "كمبوديا (855)", "كندا (1)", "كوبا (53)", "كوريا الجنوبية (82)", "كوريا الشمالية (850)", 
    "كوستاريكا (506)", "كولومبيا (57)", "كيريباتي (686)", "كينيا (254)", "لاتفيا (371)", 
    "لاوس (856)", "لبنان (961)", "لوكسمبورغ (352)", "ليبيا (218)", "ليبيريا (231)", 
    "ليتوانيا (370)", "ليختنشتين (423)", "ليسوتو (266)", "مارتينيك (596)", "مالاوي (265)", 
    "مالطا (356)", "مالي (223)", "ماليزيا (60)", "مايكرونيزيا (691)", "مصر (20)", 
    "مقدونيا الشمالية (389)", "مكاو,  الصين (853)", "منغوليا (976)", "موريتانيا (222)", 
    "موريشيوس (230)", "موزمبيق (258)", "مولدافيا (373)", "موناكو (377)", "مونتسيرات (1)", 
    "ميانمار (95)", "ناميبيا (264)", "نورو (674)", "نيبال (977)", "نيجيريا (234)", 
    "نيكاراجوا (505)", "نيوزيلندا (64)", "نيوى (683)", "هايتي (509)", "هندوراس (504)", 
    "هولندا (31)", "هونغ كونغ، الصين (852)"
  ],
  en: [
    "Afghanistan (93)", "Albania (355)", "Algeria (213)", "American Samoa (684)", "Andorra (376)", 
    "Angola (244)", "Anguilla Leeward Island (1)", "Antigua And Barbuda (1)", "Argentina (54)", 
    "Armenia (374)", "Aruba (297)", "Australia (61)", "Austria (43)", "Azerbaijan (994)", 
    "Bahamas (242)", "Bahrain (973)", "Bangladesh (880)", "Barbados (1)", "Belarus (375)", 
    "Belgium (32)", "Belize (501)", "Benin (229)", "Bermuda (1441)", "Bhutan (975)", 
    "Bolivia (591)", "Bosnia Herzegovina (387)", "Botswana (267)", "Brazil (55)", 
    "British Virgin Islands (1)", "Brunei Darussalam (673)", "Bulgaria (359)", "Burkina Faso (226)", 
    "Burundi (257)", "Cambodia (855)", "Cameroon (237)", "Canada (1)", "Cape Verde Isl. (238)", 
    "Cayman Isl. (1)", "Central African Republic (236)", "Chad (235)", "Chile (56)", 
    "China (86)", "Christmas Island (672)", "Cocos (Keeling) Island (672)", "Colombia (57)", 
    "Comoros (269)", "Congo (242)", "Congo Dem. Rep. (243)", "Cook Island (682)", "Costa Rica (506)", 
    "Cote D Ivoire (225)", "Croatia (385)", "Cuba (53)", "Curacao (599)", "Cyprus (357)", 
    "Czech Republic (420)", "Denmark (45)", "Djibouti (253)", "Dominica (1)", "Dominican Republic (1)", 
    "Ecuador (593)", "Egypt (20)", "El Salvador (503)", "Equatorial Guinea (240)", "Eritrea (291)", 
    "Estonia (372)", "Ethiopia (251)", "Falkland Island (500)", "Faroe Islands (298)", "Fiji (679)", 
    "Finland (358)", "France (33)", "French Guiana (594)", "French Polynesia (689)", "Gabon (241)", 
    "Gambia (220)", "Georgia (995)", "Germany (49)", "Ghana (233)", "Gibraltar (350)", 
    "Greece (30)", "Greenland (299)", "Grenada (473)", "Guadeloupe (590)", "Guam (671)", 
    "Guatemala (502)", "Guinea (224)", "Guinea Bissau (245)", "Guyana (592)", "Haiti (509)", 
    "Honduras (504)", "Hong Kong, China (852)", "Hungary (36)", "IC (34)", "Iceland (354)", 
    "India (91)", "Indonesia (62)", "Iran (98)", "Iraq (964)", "Ireland (353)", "Israel (972)", 
    "Italy (39)", "Jamaica (1)", "Japan (81)", "Jordan (962)", "Kazakhstan (7)", "Kenya (254)", 
    "Kiribati (686)", "Korea North (850)", "Korea South (82)", "Kuwait (965)", "Kyrgyzstan (996)", 
    "Lao P.Dem.Rep. (856)", "Latvia (371)", "Lebanon (961)", "Lesotho (266)", "Liberia (231)", 
    "Libya (218)", "Liechtenstein (423)", "Lithuania (370)", "Luxembourg (352)", "Macau,China (853)", 
    "Madagascar (261)", "Malawi (265)", "Malaysia (60)", "Maldives (960)", "Mali (223)", 
    "Malta (356)", "Marshall Island (692)", "Martinique (596)", "Mauritania (222)", 
    "Mauritius (230)", "Mexico (52)", "Micronesia (691)", "Minor U.S. Outlying Islands (1)", 
    "Moldova (373)", "Monaco (377)", "Mongolia (976)", "Montenegro (382)", "Montserrat (1)", 
    "Morocco (212)", "Mozambique (258)", "Myanmar (95)", "Namibia (264)", "Nauru (674)", 
    "Nepal (977)", "Netherlands (31)", "New Caledonia (687)", "New Zealand (64)", "Nicaragua (505)", 
    "Niger (227)", "Nigeria (234)", "Niue (683)", "Norfolk Island (6)", "North Macedonia (389)", 
    "Northern Mariana Islands (670)", "Norway (47)", "Oman (968)", "Pakistan (92)", 
    "Palau (680)", "Palestine (970)", "Panama (507)", "Papua New Guinea (675)", "Paraguay (595)", 
    "Peru (51)", "Philippines (63)", "Poland (48)", "Portugal (351)", "Puerto Rico (1)", 
    "Qatar (974)", "Republic of Kosova (383)", "Reunion (262)", "Romania (40)", 
    "Russian Federation (7)", "Rwanda (250)", "Saint Kitts and Nevis (1)", "Samoa (685)", 
    "San Marino (378)", "Sao Tome And Principe (239)", "Saudi Arabia (966)", "Senegal (221)", 
    "Serbia (381)", "Seychelles (248)", "Sierra Leone (232)", "Singapore (65)", 
    "Slovak Republic (421)", "Slovenia (386)", "Solomon Islands (677)", "Somalia (252)", 
    "South Africa (27)", "South Sudan (211)", "Spain (34)", "Sri Lanka (94)", "St. Helena (1)", 
    "St. Lucia (758)", "St. Maarten (721)", "St. Pierre and Miquelon (508)", 
    "St. Vincent and Grenadines (1)", "Sudan (249)", "Suriname (597)", "Swaziland (268)", 
    "Sweden (46)", "Switzerland (41)", "Syria (963)", "Taiwan, China (886)", "Tajikistan (992)", 
    "Tanzania (255)", "Thailand (66)", "Timor Leste (670)", "Togo (228)", "Tonga (676)", 
    "Trinidad and Tobago (1)", "Tunisia (216)", "Turkey (90)", "Turkmenistan (993)", 
    "Turks and Caicos Islands (1)", "Tuvalu (688)", "Uganda (256)", "Ukraine (380)", 
    "United Arab Emirates (971)", "United Kingdom (44)", "United States of America (1)", 
    "Uruguay (598)", "Uzbekistan (998)", "Vanuatu (678)", "Vatican City (39)", "Venezuela (58)", 
    "Vietnam (84)", "Wallis and Futuna (681)", "Yemen (967)", "Zaire (243)", "Zambia (260)", 
    "Zimbabwe (263)"
  ]
};

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const YEARS = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const sessionId = localStorage.getItem("sessionId") || "";

  const isArabic = language === "ar";
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";
  
  const titles = isArabic ? ALL_TITLES.ar : ALL_TITLES.en;
  const residenceCountries = isArabic ? ALL_RESIDENCE_COUNTRIES.ar : ALL_RESIDENCE_COUNTRIES.en;
  const phoneCodes = isArabic ? ALL_PHONE_CODES.ar : ALL_PHONE_CODES.en;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: isArabic ? "قطر (974)" : "Qatar (974)", // Default based on language
    phoneNumber: "",
    title: "",
    nameEnglish: "",
    middleName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "",
    country: isArabic ? "قطر" : "Qatar", // Default based on language
    promoCode: "",
  });

  const submitPersonalDataMutation = trpc.submissions.submitPersonalData.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    
    if (!currentSessionId) {
      toast.error(isArabic ? "جلسة غير صالحة" : "Invalid session");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    const fullDob = `${formData.birthDay}/${formData.birthMonth}/${formData.birthYear}`;

    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId: currentSessionId,
        email: formData.email,
        password: formData.password,
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
        title: formData.title,
        nameEnglish: formData.nameEnglish,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: fullDob,
        gender: formData.gender,
        country: formData.country,
        promoCode: formData.promoCode,
        nameArabic: "",
        idNumber: "",
      });
      
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      const giftId = params.get("gift") || "";
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}${giftId ? `&gift=${giftId}` : ''}&next=login-method`);
    } catch (error) {
      console.error("Error saving personal data:", error);
      toast.error(isArabic ? "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" : "Failed to save data, please try again");
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f4f4; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background-color: #ffffff; border-bottom: 2px solid #8C0032; position: relative; z-index: 1000; }
        .header-right { display: flex; align-items: center; gap: 15px; }
        .logo { height: 60px; background-color: white; padding: 0; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background-color: #8C0032; color: #ffffff; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 14px; }
        .form-container { max-width: 500px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 14px; }
        .form-group input[type="email"], .form-group input[type="password"], .form-group input[type="text"], .form-group input[type="number"], .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 14px; }
        .password-input-group { position: relative; }
        .toggle-password { position: absolute; top: 50%; transform: translateY(-50%); right: 10px; cursor: pointer; color: #8C0032; }
        .date-select-group { display: flex; gap: 10px; }
        .date-select-group select { flex: 1; }
        .gender-group { display: flex; gap: 20px; margin-top: 10px; }
        .gender-group label { display: flex; align-items: center; gap: 5px; font-weight: normal; }
        .gender-group input[type="radio"] { margin-right: 5px; }
        .submit-btn { width: 100%; padding: 12px; background-color: #8C0032; color: #ffffff; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.3s ease; }
        .submit-btn:hover { background-color: #6a0026; }
        .footer-image { width: 100%; display: block; margin-top: 20px; object-fit: cover; }
      `}</style>
      <Header />
      <div className="form-container">
        <h2 style={{ textAlign: "center", color: "#8C0032", marginBottom: "20px" }}>{isArabic ? "البيانات الشخصية" : "Personal Details"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group password-input-group">
            <label htmlFor="password">{isArabic ? "كلمة المرور" : "Password"}</label>
            <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} required />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          <div className="form-group password-input-group">
            <label htmlFor="confirmPassword">{isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
            <input type={showPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="countryCode">{isArabic ? "رمز الدولة" : "Country Code"}</label>
            <select id="countryCode" name="countryCode" value={formData.countryCode} onChange={handleChange} required>
              {phoneCodes.map((code, index) => (
                <option key={index} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">{isArabic ? "رقم الهاتف" : "Phone Number"}</label>
            <input type="number" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="title">{isArabic ? "اللقب" : "Title"}</label>
            <select id="title" name="title" value={formData.title} onChange={handleChange} required>
              <option value="">{isArabic ? "اختر لقبك" : "Select your title"}</option>
              {titles.map((title, index) => (
                <option key={index} value={title}>{title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="nameEnglish">{isArabic ? "الاسم الأول (باللغة الإنجليزية)" : "First Name (English)"}</label>
            <input type="text" id="nameEnglish" name="nameEnglish" value={formData.nameEnglish} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="middleName">{isArabic ? "الاسم الأوسط (باللغة الإنجليزية)" : "Middle Name (English)"}</label>
            <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">{isArabic ? "اسم العائلة (باللغة الإنجليزية)" : "Last Name (English)"}</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <div className="date-select-group">
              <select name="birthDay" value={formData.birthDay} onChange={handleChange} required>
                <option value="">{isArabic ? "اليوم" : "Day"}</option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required>
                <option value="">{isArabic ? "الشهر" : "Month"}</option>
                {MONTHS.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select name="birthYear" value={formData.birthYear} onChange={handleChange} required>
                <option value="">{isArabic ? "السنة" : "Year"}</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>{isArabic ? "الجنس" : "Gender"}</label>
            <div className="gender-group">
              <label>
                <input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} required />
                {isArabic ? "ذكر" : "Male"}
              </label>
              <label>
                <input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} required />
                {isArabic ? "أنثى" : "Female"}
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="country">{isArabic ? "بلد الإقامة" : "Country of Residence"}</label>
            <select id="country" name="country" value={formData.country} onChange={handleChange} required>
              {residenceCountries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="promoCode">{isArabic ? "الرمز الترويجي (اختياري)" : "Promo Code (Optional)"}</label>
            <input type="text" id="promoCode" name="promoCode" value={formData.promoCode} onChange={handleChange} />
          </div>
          <button type="submit" className="submit-btn">{isArabic ? "إرسال" : "Submit"}</button>
        </form>
      </div>
      <img src={footerImage} alt="Footer Banner" className="footer-image" />
    </div>
  );
}
