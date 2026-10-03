

export default async function geocode(queryLocation) {
    const urlBuilder = new URLSearchParams({ q: queryLocation, format: 'json', limit: '5'}).toString()
    const url = `https://nominatim.openstreetmap.org/search?${urlBuilder}`

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'fade-board/1.0 (https://github.com/minwooouni886-ui/fade-board)',
            'Accept-Language': 'en'
        },
    })

    if (!response.ok) {
        throw new Error(`Nominatim request failed with status ${response.status}`)
    }

    
    const array = await response.json()
    return array.map(res => ({name: res.display_name, lat: Number(res.lat), lon: Number(res.lon)}))
}