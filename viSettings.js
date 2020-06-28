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