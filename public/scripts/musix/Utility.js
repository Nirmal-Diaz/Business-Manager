//@ts-check
export class Utility {
    static getCircularSliderValue(slider, rangeUpperLimit) {
        //Get sliderValue as theta
        const thetaString = slider.style.transform;
        const theta = thetaString.slice(7, thetaString.length - 4);
        //Calculate currentSeekedValue according to theta
        const unit = rangeUpperLimit / 360;
        const currentSeekedValue = theta * unit;
        //Output currentSeekedValue
        return currentSeekedValue;
    }

    static setCircularSliderView(slider, rangeUpperLimit, value) {
        //Calculate the size of a single unit (seconds per degree)
        const unit = rangeUpperLimit / 360;
        //Calculate theta using currentTime
        const theta = value / unit;
        //Rotate seekSlider theta degrees
        slider.style.transform = `rotate(${theta}deg)`;
    }

    static formatTime(totalSeconds) {
        //Calculate time to HH:MM:SS format
        const minutesAsFraction = totalSeconds / 60;
        let wholeMinutes = Math.floor(minutesAsFraction);
        let resultingSeconds = Math.round(60 * (minutesAsFraction - wholeMinutes));
        //Format integers for leading zeros
        if (wholeMinutes < 10) { wholeMinutes = "0" + wholeMinutes; }
        if (resultingSeconds < 10) { resultingSeconds = "0" + resultingSeconds; }
        //Output formatted time
        return (wholeMinutes + ":" + resultingSeconds);
    }

    static getRandInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandColor() {
        return `rgb(${Utility.getRandInt(100, 255)}, ${Utility.getRandInt(100, 255)}, ${Utility.getRandInt(100, 255)})`;
    }
}