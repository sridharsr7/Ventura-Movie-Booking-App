
const getMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const runTest = () => {
    // Mock Data
    const movieDuration = 120; // 2 hours
    const existingShow = {
        _id: '1',
        time: '10:00',
        date: new Date('2025-01-01T00:00:00Z'),
        movie: { duration: movieDuration }
    };

    const screenShowtimes = [existingShow];

    // Case 1: Exact Same Time
    let newTime = '10:00';
    let newDate = '2025-01-01';

    let newStart = getMinutes(newTime);
    let newEnd = newStart + movieDuration + 20;

    // Logic from partner.js
    let newShowDate = new Date(newDate).toISOString().split('T')[0];

    let hasOverlap = screenShowtimes.some(show => {
        // Line 414
        if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
        if (!show.movie) return false;

        const existingStart = getMinutes(show.time);
        const existingEnd = existingStart + show.movie.duration;

        // Line 420
        return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
    });

    console.log(`Case 1 (Exact Match): Overlap Detected? ${hasOverlap}`); // Should be true

    // Case 2: Overlap Start (New starts inside existing)
    newTime = '11:00'; // Existing ends at 12:00
    newStart = getMinutes(newTime);
    newEnd = newStart + movieDuration + 20;

    hasOverlap = screenShowtimes.some(show => {
        if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
        if (!show.movie) return false;
        const existingStart = getMinutes(show.time);
        const existingEnd = existingStart + show.movie.duration;
        return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
    });
    console.log(`Case 2 (Start Inside): Overlap Detected? ${hasOverlap}`); // Should be true

    // Case 3: No Overlap (After existing ends + buffer?)
    // Existing: 10:00 (600) to 12:00 (720).
    // Buffer logic in finding NEW END is +20. But existing end is just duration.
    // Logic check: max(newStart, existingStart) < min(newEnd, existingEnd)

    // New show at 12:01.
    newTime = '12:01';
    newStart = getMinutes(newTime); // 721
    newEnd = newStart + movieDuration + 20;

    hasOverlap = screenShowtimes.some(show => {
        if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
        if (!show.movie) return false;
        const existingStart = getMinutes(show.time);
        const existingEnd = existingStart + show.movie.duration; // 720
        return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
    });
    // max(721, 600) -> 721. min(end, 720) -> 720. 721 < 720 is FALSE.
    console.log(`Case 3 (Just After): Overlap Detected? ${hasOverlap}`); // Should be false


    // Case 4: Overlap via Buffer?
    // Wait, the buffer `+ 20` is added to `newEnd`.
    // It is NOT added to `existingEnd`.
    // So if New Show is *before* Existing Show, we need `newEnd` to clear `existingStart`.

    // New show at 07:50. Ends at 09:50 + 20 buffer? = 10:10.
    newTime = '07:50';
    newStart = getMinutes(newTime); // 470
    newEnd = newStart + movieDuration + 20; // 470 + 120 + 20 = 610 (10:10)

    // Existing starts at 10:00 (600).
    // max(470, 600) = 600. min(610, 720) = 610.
    // 600 < 610 -> TRUE.
    hasOverlap = screenShowtimes.some(show => {
        if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
        if (!show.movie) return false;
        const existingStart = getMinutes(show.time);
        const existingEnd = existingStart + show.movie.duration;
        return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
    });
    console.log(`Case 4 (Buffer Overlap): Overlap Detected? ${hasOverlap}`); // Should be TRUE if we enforce buffer both ways

    // Wait, user says "only one show... or upto the movie end time can add".
    // Does the user want the buffer? "upto the movie end time" implies strict duration?
    // But usually theaters need cleaning time.
    // The previous code enforces a 20 min buffer on the *new* show being added.
    // But it does *not* seem to enforce buffer on the *existing* show?
    // line 418: `const existingEnd = existingStart + show.movie.duration;` (No buffer).

    // If I add a show at 12:05 (Existing ends 12:00).
    // New starts 12:05. Existing end 12:00. No overlap.
    // But existing show needs cleaning time?
    // Ideally we should add buffer to existingEnd too?

};

runTest();
