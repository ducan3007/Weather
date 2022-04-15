# Bài tập tuần Phát triển ứng dụng di động


### Các API và KEY
```typescript
// Google Map API
const MAP_API = "https://maps.google.com/maps/api/geocode/json";
const MAP_API_KEY = "AIzaSyAk0a0h9pQr4stN525U64SNJt14XiuzQZA";

// Weatherapi API
const WEATHER_API = "http://api.weatherapi.com/v1";
const WEATHER_API_KEY = "a76b88c372ad491a8e045458221404";
```

### Yêu cầu quyền truy cập vị trí và lấy tọa độ hiện tại

```typescript
const getLocationAsync = async (): Promise<void> => {

    // Yêu cầu quyền vị trí
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
    console.log("Permission to access location was denied");
      return;
    }
    
    // lấy tọa độ hiện tại
    let position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    ....
  }
```        

### Hàm gọi Google Map API để lấy thông tin về địa chỉ hiện tại dựa vào kinh độ - vĩ độ

```typescript
const getGoogleMapLocation = async (latitude: number, longitude: number): Promise<GoogleMapLocation> => {
  try {
    
    // Lấy địa chỉ hiện tại
    let response = await fetch(`${MAP_API}?key=${MAP_API_KEY}&language=en&latlng=${latitude},${longitude}`);
    ....
    
  }catch(error){
    throw error;
  }
};
```
### Hàm lấy thông tin thời tiết vị trí về hiện tại + thông tin dự báo

```typescript

const getWeather = async (latitude: number, longitude: number, forecast?: number): Promise<Weather[]> => {
  try {
    if (!forecast) {
      
      // lấy thông tin hiện tại
      let response = await fetch(`${WEATHER_API}/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&lang=vi`);
       ....
      
    } else {
    
      // Dự báo
      let response = await fetch(`${WEATHER_API}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=5&lang=vi`);
     
     ....
    }
  } catch (error) {
    throw error;
  }
};
```

