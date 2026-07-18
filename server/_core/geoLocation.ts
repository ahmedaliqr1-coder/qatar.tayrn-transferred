/**
 * خدمة الحصول على معلومات الموقع الجغرافي من عنوان IP
 */

export async function getCountryFromIP(ipAddress?: string): Promise<string> {
  try {
    // إذا لم يتم توفير عنوان IP، سنحاول استخدام خدمة عامة
    const url = ipAddress 
      ? `https://ipapi.co/${ipAddress}/json/`
      : `https://ipapi.co/json/`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch IP geolocation');
      return 'Qatar'; // القيمة الافتراضية
    }
    
    const data = await response.json();
    
    // استخراج اسم الدولة من الاستجابة
    const countryName = data.country_name || 'Qatar';
    
    return countryName;
  } catch (error) {
    console.error('Error fetching country from IP:', error);
    return 'Qatar'; // القيمة الافتراضية في حالة الخطأ
  }
}
