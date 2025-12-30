const axios = require('axios');

async function checkScreen() {
    try {
        const res = await axios.get('http://localhost:5000/api/partner/screens/694bdc459f99064c4622a625');
        const screen = res.data;
        console.log(`Rows: ${screen.rows}, Columns: ${screen.columns}`);
        console.log("Special Seats (first 50):", screen.specialSeats.slice(0, 50));


        for (let r = 0; r < screen.rows; r++) {
            let gapCount = 0;
            let disabledCount = 0;
            let standardCount = 0;
            for (let c = 0; c < screen.columns; c++) {
                const seat = screen.specialSeats.find(s => s.row === r && s.col === c);
                const status = seat ? seat.status : 'standard';
                if (status === 'gap') gapCount++;
                else if (status === 'disabled') disabledCount++;
                else standardCount++;
            }
            console.log(`Row ${r}: Standard=${standardCount}, Gap=${gapCount}, Disabled=${disabledCount}`);
        }

        console.log("Row Names:", screen.rowNames);
    } catch (e) {
        console.error(e);
    }
}

checkScreen();
