//função recebe dois pontos e devolve a distância em metros
const raio_terra = 6371000;

const radianos = (graus: number): number =>(graus * Math.PI)/180;

export function haversine(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const dLat = radianos(lat2-lat1);
    const dLon = radianos(lon2-lon1);

    const a= 
        Math.sin(dLat/2)** 2 + Math.cos(radianos(lat1)) * Math.cos(radianos(lat2))* Math.sin(dLon/2)**2;

        return raio_terra * 2*Math.asin(Math.sqrt(a));

}