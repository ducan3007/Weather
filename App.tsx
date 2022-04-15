import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";

interface Coords {
  latitude: any;
  longitude: any;
}
interface GoogleMapLocation {
  group: any;
  district: any;
  city: any;
  country: any;
}
interface Weather {
  temp_c: number;
  feelslike_c?: number;
  condition?: String;
  wind_kph: number;
  humidity: number;
  uv?: number;
  pressure_mb?: number;
  date?: String;
  rain?: number;
}

const MAP_API = "https://maps.google.com/maps/api/geocode/json";
const MAP_API_KEY = "AIzaSyAk0a0h9pQr4stN525U64SNJt14XiuzQZA";

const WEATHER_API = "http://api.weatherapi.com/v1";
const WEATHER_API_KEY = "a76b88c372ad491a8e045458221404";

const getGoogleMapLocation = async (latitude: number, longitude: number): Promise<GoogleMapLocation> => {
  try {
    let response = await fetch(`${MAP_API}?key=${MAP_API_KEY}&language=en&latlng=${latitude},${longitude}`);
    let result = await response.json();
    return {
      group: result.results[0].address_components[2].long_name,
      district: result.results[0].address_components[3].long_name,
      city: result.results[0].address_components[4].long_name,
      country: result.results[0].address_components[5].long_name,
    };
  } catch (error) {
    throw error;
  }
};

const getWeather = async (latitude: number, longitude: number, forecast?: number): Promise<Weather[]> => {
  try {
    if (!forecast) {
      let response = await fetch(
        `${WEATHER_API}/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&lang=vi`
      );
      let result = await response.json();
      return [
        {
          temp_c: result.current.temp_c,
          feelslike_c: result.current.feelslike_c,
          condition: result.current.condition.text,
          wind_kph: result.current.wind_kph,
          humidity: result.current.humidity,
          uv: result.current.uv,
          pressure_mb: result.current.pressure_mb,
        },
      ];
    } else {
      let response = await fetch(
        `${WEATHER_API}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=5&lang=vi`
      );
      let result = await response.json();
      return forecast = result.forecast.forecastday.map((item: any) => {
        return {
          date: item.date,
          temp_c: item.day.avgtemp_c,
          rain: item.day.daily_chance_of_rain,
          humidity: item.day.avghumidity,
          wind_kph: item.day.maxwind_kph,
        };
      });
    }
  } catch (error) {
    throw error;
  }
};

export default function App() {
  const [coords, setCoords] = useState<Coords>({ latitude: "", longitude: "" });
  const [location, setLocation] = useState<GoogleMapLocation>();
  const [current, setCurrent] = useState<Weather[]>([]);
  const [forecast, setForecast] = useState<Weather[]>([]);

  useEffect(() => {
    const getLocationAsync = async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }
        let position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });

        let googleLocation = await getGoogleMapLocation(position.coords.latitude, position.coords.longitude);
        setLocation(googleLocation);
        
        let weathershot = await Promise.all([getWeather(position.coords.latitude, position.coords.longitude), getWeather(position.coords.latitude, position.coords.longitude, 1)]);
       
        setCurrent(weathershot[0]);
        setForecast(weathershot[1]);

      } catch (error) {
        console.log(error);
      }
    };
    getLocationAsync();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {current.length > 0 && location && (
        <ScrollView>
          <View style={styles.location}>
            <Text style={{ fontSize: 26, color: "#f2faf9" }}>{`${location?.district}`}</Text>
            <Text style={{ fontSize: 20, color: "#e1edec" }}>{`${location?.city}`}</Text>
          </View>
          <View style={[styles.current]}>
            <View style={{ alignSelf: "center" }}>
              <Text style={{ fontSize: 100, color: "#e1fcfc" }}>{current[0]?.temp_c}</Text>
              <Text style={{ fontSize: 30, color: "#e1fcfc", position: "absolute", top: 35, right: -45 }}>°C</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: "#e1fcfc", alignSelf: "center", marginTop: -20 }}>
                {current[0]?.condition}
              </Text>
              <Text style={[styles.text,{paddingLeft:5}]}>{`Độ ẩm : ${current[0]?.humidity}%`}</Text>
              <Text style={[styles.text,{paddingLeft:5}]}>{`Gió : ${current[0]?.wind_kph} km/h`}</Text>
              <Text style={[styles.text,{paddingLeft:5}]}>{`Cảm giác như : ${current[0]?.feelslike_c}°c`}</Text>
              <Text style={[styles.text,{paddingLeft:5}]}>{`UV : ${current[0]?.uv}`}</Text>
              <Text style={[styles.text,{paddingLeft:5}]}>{`Áp suất : ${current[0]?.pressure_mb}mb`}</Text>
            </View>
          </View>
          <View style={styles.forecase}>
            <Text style={{ alignSelf: "center", fontSize: 23, color: "#f2faf9" }}>Dự báo 3 ngày</Text>

            {forecast.map((item: Weather, index: number) => {
              return (
                <View key={index}>
                  <Text style={[styles.text,{fontWeight:'bold'},{paddingLeft:5}]}>Ngày : {item.date}</Text>
                  <Text style={[styles.text,{paddingLeft:20}]}>Nhiệt độ : {item.temp_c}°c</Text>
                  <Text style={[styles.text,{paddingLeft:20}]}>Mưa : {item.rain}%</Text>
                  <Text style={[styles.text,{paddingLeft:20}]}>Độ ẩm : {item.humidity}%</Text>
                  <Text style={[styles.text,{paddingLeft:20}]}>Gió : {item.wind_kph} km/h</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      {!(current.length > 0) && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#e1fcfc"></ActivityIndicator>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 34,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#3A95C0",
  },
  location: {
    flex: 1,
    alignItems: "center",
  },
  current: {
    flex: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#e6fff1",
    paddingBottom:10
  },
  forecase: {
    paddingTop: 10,
    flex: 4,
    borderTopWidth: 2,
    borderTopColor: "#e6fff1",
  },
  text: {
    fontSize: 15,
    color: "#e1fcfc",
  },
});
