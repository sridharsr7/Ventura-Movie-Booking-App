async function testCityFilter() {
    try {
        console.log('Testing with city=Chennai...');
        const res1 = await fetch('http://localhost:5000/api/movies?city=Chennai');
        const data1 = await res1.json();
        console.log(`Movies in Chennai: ${data1.length}`);

        console.log('Testing with city=Mumbai...');
        const res2 = await fetch('http://localhost:5000/api/movies?city=Mumbai');
        const data2 = await res2.json();
        console.log(`Movies in Mumbai: ${data2.length}`);

        console.log('Testing without city (all movies)...');
        const res3 = await fetch('http://localhost:5000/api/movies');
        const data3 = await res3.json();
        console.log(`All Movies: ${data3.length}`); 

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testCityFilter();
