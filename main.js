window.onload = function(){

//default style siri wave
let siriWaveA = new SiriWave({
	container: document.getElementById('siri-container-a'),
	width: 1000,
	height: 200,
	speed: 0.0,
	amplitude: 0.0,
	autostart: true
});

//iOS 9 style siri wave
let siriWaveB = new SiriWave({
	container: document.getElementById('siri-container-b'),
	width: 1000,
	height: 200,
	speed: 0.0,
	amplitude: 0.0,
	autostart: true,
	style: 'ios9'
});

//application state object
let stateObject = {
    'currentState': 'stopped',
  	'activeState': 'default'
};

//audio input source
let source = undefined;
//siriwave selection
let siriWave = siriWaveA;

//permission success callback
let handleSuccess = function(stream) {
     //context depending on browser(Chrome/Firefox)
     let context =  new (window.AudioContext || window.webkitAudioContext)();
     //create source for sound input.
     source = context.createMediaStreamSource(stream);
     //create processor node.
     let processor = context.createScriptProcessor(1024, 1, 1);
     //create analyser node.
     let analyser = context.createAnalyser();
     //set fftSize to 4096
     analyser.fftSize = 4096;
     //array for frequency data.
     let myDataArray = new Float32Array(analyser.frequencyBinCount); 

     //connect source->analyser->processor->destination.
     source.connect(analyser);
     analyser.connect(processor);
     processor.connect(context.destination);

     //start siriwave
     siriWave.start();
    
     //event for change in audio data from source.
     processor.onaudioprocess = function(e) {

    	let amplitude = 0;
        let frequency = 0;

        //copy frequency data to myDataArray from analyser.
        analyser.getFloatFrequencyData(myDataArray);

        //get max frequency which is greater than -100 dB.
        myDataArray.map((item, index)=>{
            let givenFrequencyDB = item;

            if(givenFrequencyDB>-100){
                frequency = Math.max(index,frequency);
            }
        });

        //multipy frequency by resolution and divide it to scale for setting speed.
        frequency = ((1+frequency)*11.7185)/24000;
        //set the speed for siriwave
        siriWave.setSpeed(frequency);

        //find the max amplituded
     	e.inputBuffer.getChannelData(0).map((item)=>{
     		amplitude = Math.max(amplitude, Math.abs(item));
     	});

     	//output buffer data.
     	//console.log(e.outputBuffer.getChannelData(0));

        //scale amplituded from [-1, 1] to [0, 10].
        amplitude = Math.abs(amplitude*10);

        //if amplitude is greater than 0 then set siriwave amplitude else set to 0.0.
        if(amplitude>=0){
            siriWave.setAmplitude(amplitude);
        }else{
            siriWave.setAmplitude(0.0);
        }
        
     };
 };

//method to start recording
 let startRecording = function(){       
    //get user permission to access microphone data.
    if(stateObject.currentState === 'stopped'){
    	 stateObject.currentState = 'started';
   		 navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        })
        .then(handleSuccess);
    }
 };

//mthod to toggle type of wave
 let toggleWave = function(){

 	 let containera =  document.getElementById('siri-container-a');
 	 let containerb =  document.getElementById('siri-container-b');

 	 if(stateObject.activeState==='default'){
 	 	 siriWave = siriWaveB;
 	 	 stateObject.activeState = 'ios9';
 	 	 containerb.style.display = 'block';
 	 	 containera.style.display = 'none';
 	 }else if(stateObject.activeState==='ios9'){
 	 	 siriWave = siriWaveA;
 	  	 stateObject.activeState = 'default';
 	  	 containerb.style.display = 'none';
 	 	 containera.style.display = 'block';
 	 }
 }
//method to stop recording
 let stopRecording = function(){
     siriWave.setAmplitude(0);
     siriWave.setSpeed(0);
     source.disconnect();
     stateObject.currentState = 'stopped';
 };

//method to set controls on buttons
 let setControlEvents = function(){
    let recordBtn = document.getElementById('start-recording');
    let stopBtn = document.getElementById('stop-recording');
 	let toggleBtn = document.getElementById('toggle');
    let containerb = document.getElementById('siri-container-b');

 	toggleBtn.addEventListener('click', function(){
 		toggleWave();
 	})

    recordBtn.addEventListener('click', function(){
        startRecording();
    });

    stopBtn.addEventListener('click', function(){
        stopRecording();
    });

    //hide wave type b by default
    containerb.style.display = 'none';
 };
 
 setControlEvents();

};