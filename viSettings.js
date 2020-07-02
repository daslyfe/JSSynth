setup(p5, ref)

// let x;
// let y;
// let fftArray = FFT.getValue();
// let fftVal = Math.clamp(fftArray[10], -150, 150) * -1
// console.log(fftVal);
let scale = 3; //zoom of effect between 1.5 and 7
let fragmentation = 3; //between 1 and 10
let busyness = 10000; //between 20 & 10000 smaller == busier;
let density = 10//between 10 and 1000;
let tilt = 0; //between 0 and 2
let shift = 8; //between -4 and 4
let speed = 0
// t > 100 ? t = 0: t = t
t +=1;
p5.scale(scale)
// for (let y = 0; y < 300; y++) {
//     for (let x = 0; x < 300; x++) { 
//         (t + p5.abs(((x )+ (y * shift) -t)^(x - y  + t)) ** fragmentation) % busyness < density && p5.point(x,  y-(x * tilt))
//     }
// }
for (let y = 0; y < 300; y++) {

    for (let x = 0; x < 300; x++) {
        if (((t * speed) + p5.abs(((x) + (y ^ shift) & (t & x)) & (x-y + t )) ** fragmentation) % busyness < density)
        
        p5.point(x, y);
    }
}


//space invaders
let draw = (p5, canvasParentRef) => {
    setup(p5, ref)

    // let x;
    // let y;
    // let fftArray = FFT.getValue();
    // let fftVal = Math.clamp(fftArray[10], -150, 150) * -1
    // console.log(fftVal);
    let scale = 3; //zoom of effect between 1.5 and 7
    let fragmentation = 2; //between 1 and 10
    let busyness = 300; //between 20 & 10000 smaller == busier;
    let density = 10//between 10 and 1000;
    let tilt = 0; //between 0 and 2
    let shift = 1; //between -4 and 4
    let speed = 0
    // t > 100 ? t = 0: t = t
    t +=-.07  ;
    p5.scale(scale)
    // for (let y = 0; y < 300; y++) {
    //     for (let x = 0; x < 300; x++) { 
    //         (t + p5.abs(((x )+ (y * shift) -t)^(x - y  + t)) ** fragmentation) % busyness < density && p5.point(x,  y-(x * tilt))
    //     }
    // }
    for (let y = 0; y < 300; y++) {
    
        for (let x = 0; x < 300; x++) {
            if (((t * speed) + p5.abs(((x) & (y ^ shift) ^ (t ^ x)) ^ (x-y   )) ** fragmentation) % busyness < density)
            
            p5.point(x, y);
        }
    }

};

//pyramids

let draw = (p5, canvasParentRef) => {
    setup(p5, ref)

    // let x;
    // let y;
    // let fftArray = FFT.getValue();
    // let fftVal = Math.clamp(fftArray[10], -150, 150) * -1
    // console.log(fftVal);
    let scale = 3; //zoom of effect between 1.5 and 7
    let fragmentation = 3; //between 1 and 10
    let busyness = 300; //between 20 & 10000 smaller == busier;
    let density = 100//between 10 and 1000;
    let tilt = 0; //between 0 and 2
    let shift = 0; //between -4 and 4
    let speed = 1
    // t > 100 ? t = 0: t = t
    t += 1;
    p5.scale(scale)

    for (let y = 0; y < 300; y++) {
    
        for (let x = 0; x < 300; x++) {
            if (((t * speed) + p5.abs(((x) ^  (y ^ shift)  )^ (x-y    )) ** fragmentation) % busyness < density)
            
            p5.point(x, y);
        }
    }

};


//weird running

let draw = (p5, canvasParentRef) => {
    setup(p5, ref)

    // let x;
    // let y;
    // let fftArray = FFT.getValue();
    // let fftVal = Math.clamp(fftArray[10], -150, 150) * -1
    // console.log(fftVal);
    let scale = 3; //zoom of effect between 1.5 and 7
    let fragmentation = 3; //between 1 and 10
    let busyness = 300; //between 20 & 10000 smaller == busier;
    let density = 100//between 10 and 1000;
    let tilt = 0; //between 0 and 2
    let shift = 10; //between -4 and 4
    let speed = 1
    // t > 100 ? t = 0: t = t
    t += 1;
    p5.scale(scale)

    for (let y = 0; y < 300; y++) {
    
        for (let x = 0; x < 300; x++) {
            if (((t * speed) + p5.abs(((x) + (y ^ shift)  )^ (x-y    )) ** fragmentation) % busyness < density)
            
            p5.point(x, y);
        }
    }

};
//thematrix
let draw = (p5, canvasParentRef) => {
    setup(p5, ref)

    // let x;
    // let y;
    // let fftArray = FFT.getValue();
    // let fftVal = Math.clamp(fftArray[10], -150, 150) * -1
    // console.log(fftVal);
    let scale = 3; //zoom of effect between 1.5 and 7
    let fragmentation = 7; //between 1 and 10
    let busyness = 1000; //between 20 & 10000 smaller == busier;
    let density = 100//between 10 and 1000;
    let tilt = 0; //between 0 and 2
    let shift = 0; //between -4 and 4
    let speed = -1
   
    // t > 100 ? t = 0: t = t
    t += 1;
    p5.scale(scale)

   
    let scroll = false;
    let stagger = 16;
    let scrollSpeed = 0;
    let scrollVal = scroll ? (t ^ stagger) << scrollSpeed: 0;
    
    

    for (let y = 0; y < 300; y++) {
       
    
        for (let x = 0; x < 300; x++) {
            if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal )^ (x-y  + scrollVal )) ** fragmentation) % busyness < density)
            
            p5.point(y, x);
        }
    }

};

//pyramids cool
let draw = (p5, canvasParentRef) => {
    let fragmentation = 7; //between 1 and 10
    let busyness = 1000; //between 20 & 10000 smaller == busier;
    let density = 100//between 10 and 1000;
    let shift = 0; //between -4 and 4
    let speed = -1
    let scroll = false;
    let stagger = 16;
    let scrollSpeed = 0;
    let scrollVal = scroll ? (t ^ stagger) << scrollSpeed: 0;

    t += 1;

    for (let y = 0; y < 300; y++) {
        for (let x = 0; x < 300; x++) {
            if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal ) & (x-y  + scrollVal )) ** fragmentation) % busyness < density) 
            p5.point(y, x);   
        }
    }

};

//magic fireworks
let draw = (p5, canvasParentRef) => {
    setup(p5, ref)
    let fftArray = FFT.getValue();
    let scale = 3; //zoom of effect between 1.5 and 7
    let fragmentation = 7; //between 1 and 10
    let busyness = 1000; //between 20 & 10000 smaller == busier;
    let density = 100//between 10 and 1000;
    let shift = 0; //between -4 and 4
    let speed = -1
    let scroll = false;
    let stagger = 0;
    let scrollSpeed = 0;
    let scrollVal = scroll ? (t ^ stagger) << scrollSpeed: 0;
     
    t += knob.four.val * 6;
    p5.scale(scale);
    // let colorPar = t%240
    // let color = 'rgb(' + 15  +  ',' +  37  + ',' + colorPar + ')';
    // p5.stroke(color)

    // for (y = 0; y < 300; y++) {
    //     for (x = 0; x < 300; x++) {
    //         if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal ) ^ (x-y  + scrollVal )) ** fragmentation) % busyness < density)           
    //         p5.point(y, x);         
    //     }
    // }
    //lowest = -200 highest 0 ymax = 80 xmax = 106

    let mapPoint = (value, key) => {
        count++;
        key *= .5;
        value *=-1;
        let comp = t 
        let y = value & comp
        let x = key & comp
        p5.point(x, y)
    };
    let min_value = Math.max.apply(null, fftArray)
    console.log(min_value)
    count = 0;
    fftArray.map(mapPoint);
};

//dancing particles
let draw = (p5, canvasParentRef) => {
    setup(p5, ref)
    let fftArray = FFT.getValue();
    let scale = 3; //zoom of effect between 1.5 and 7
    let fragmentation = 7; //between 1 and 10
    let busyness = 1000; //between 20 & 10000 smaller == busier;
    let density = 100//between 10 and 1000;
    let shift = 0; //between -4 and 4
    let speed = -1
    let scroll = false;
    let stagger = 0;
    let scrollSpeed = 0;
    let scrollVal = scroll ? (t ^ stagger) << scrollSpeed: 0;
     
    t += knob.four.val * 6;
    p5.scale(scale);
    // let colorPar = t%240
    // let color = 'rgb(' + 15  +  ',' +  37  + ',' + colorPar + ')';
    // p5.stroke(color)

    // for (y = 0; y < 300; y++) {
    //     for (x = 0; x < 300; x++) {
    //         if (((t * speed) + p5.abs(((x) + (y ^ shift) + scrollVal ) ^ (x-y  + scrollVal )) ** fragmentation) % busyness < density)           
    //         p5.point(y, x);         
    //     }
    // }
    //lowest = -200 highest 0 ymax = 80 xmax = 106

    let mapPoint = (value, key) => {
        count++;
        key *= .5;
        value *=-1;
        let comp = t%80
        let size = 1;
        let y = ((value ^ comp) * size)
        let x = ((key) * size)
        p5.point(x, y)
    };
    let min_value = Math.max.apply(null, fftArray)
    console.log(min_value)
    count = 0;
    fftArray.map(mapPoint);
};

//simple bars

function VideoSynth() {
    let setup = (p5, ref) => {
        p5.createCanvas(500, 500).parent(ref);
        p5.stroke('teal')
        p5.noSmooth();
    };

    let refresh = (p5, ref) => {
        p5.clear(); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
        p5.scale(3);
    }

    const lows = [], mids = [], highs = [];
    let low = 0, middle = 0, high = 0;
    const screenWidth = 80;

    let draw = (p5) => {
        let fftArray = FFT.getValue();
        refresh(p5);
        lows.push(fftArray[1] * -1);
        mids.push(fftArray[3] * -1);
        highs.push(fftArray[9] * -1)
        if (lows.length >= 5) {
            lows.shift()
            mids.shift()
            highs.shift()
        }
        low = median(lows)
        middle = median(mids)
        high = median(highs);
      
        for (let x = 0; x < screenWidth; x++) {
            x < 33 ? p5.point(x, low) : x < 66 ? p5.point(x, middle) : p5.point(x, high);
        };
    };
    return <Sketch setup={setup} draw={draw} />;
}

