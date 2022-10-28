const socket = io('/')
const myPeer = new Peer(undefined, {
    secure: false, 
    port: location.port, 
    host: location.hostname,
    path: "peerjs"
})
let peers = {}

let search = ""
let string = "0123456789abcdefghijklmnopjrstuvwxyz"
let userID = ROOM_ID

let params = new URLSearchParams(location.search);
let playble = params.get("p")
let listenble = params.get("l")
const audioCast = document.getElementById("audio")

checkLink(userID)

myPeer.on('open', id=>{
    socket.emit('join-room', userID, id)
})

if(playble)
    audioAccess()
else
    myPeer.on('call', call=>{
        console.log('call')
        call.answer()
        call.on('stream', userStream => {
            console.log(userStream)
            // audioCast.srcObject = userStream

            addAudioeoStream(audioCast, userStream)
        })
    })

function audioAccess() {
    navigator.mediaDevices.getDisplayMedia({ 
        audio: true, 
        video: true
     })
     .then(stream => {

        socket.on('user-connected', userId => {
            console.log('ansB')
            connectToNewUser(userId, stream)
        })

        myPeer.on('call', call=>{
            console.log('ans')
            call.answer(stream)
        })

        myPeer.on('call', call=>{
            console.log('ans')
            call.answer(stream)
        })

        $(".scotch.small").css('display', 'none')
    })
    .catch(error => {
        console.log(error);
    })
}

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)

    call.on('close', ()=>{
        video.remove()
    })

    peers[userId]=call
}

function addAudioeoStream(audio, stream){
    setTimeout(function() {
        audio.srcObject = stream
        audio.addEventListener('loadedmetadata', ()=>{
            document.getElementById('pause').addEventListener('click', ()=>{
                audio.play()
            })
        })
    }, 1500)
}

function checkLink(userID) {
    params = new URLSearchParams(location.search);
    playble = params.get("p")
    listenble = params.get("l")
    if (playble && playble != userID) {
        window.history.pushState($(this).attr('id'), "Title", "?p=" + userID)
        return
    }
    if ((!playble && !listenble) || (playble && listenble)) {
        window.history.pushState($(this).attr('id'), "Title", "?p=" + userID)
        return
    }
}


$(function () {

    prepareTape(userID, listenble)
    

    // if (!localStorage.getItem('userID'))
    //     $.get('https://www.cloudflare.com/cdn-cgi/trace', function (data) {
    //         data = data.trim().split('\n').reduce(function (obj, pair) {
    //             pair = pair.split('=');
    //             return obj[pair[0]] = pair[1], obj;
    //         }, {});
    //         let ip = data['ip']
    //         localStorage.setItem("userID", ipTransform(ip))
    //     }).done(function () {
    //         userID = localStorage.getItem('userID')
    //         checkLink(userID)
    //         prepareTape(userID, listenble)
    //         myPeer.on('open', id=>{
    //             socket.emit('join-room', userID, id)
    //         })
    //     });
    // else {
    //     userID = localStorage.getItem('userID')
    //     checkLink(userID)
    //     prepareTape(userID, listenble)
    //     myPeer.on('open', id=>{
    //         socket.emit('join-room', userID, id)
    //     })
    // }
    
    socket.on('user-connected', userId =>{
        console.log('User connected '+userId)
    })
    
    socket.on('user-disconnected', userId=>{
        if(peers[userId]) peers[userId].close()
    })

    

    $(".microphone").click(function () {
        audioAccess()
    })

    $('.button').click(function () { $(this).toggleClass('active') })
    $('.cap').click(function () {
        if ($('.cap').hasClass('open'))
            $('#open').click()
    })
    $('#open').click(openCap)

    $('.popup').on('click', function () {
        if ($('.popup').css('display') == 'flex' && $(event.target).is('.popup')) {
            togglePopup()
        }
    })

    $('.copy').click(function () {
        let text = playble;
        var input = document.createElement('input');
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.select();
        var result = document.execCommand('copy');
        document.body.removeChild(input);
    })

    $('.scotch-title').focusin(() => $('.pencil').hide())
    $('.scotch-title').focusout(function () {
        $('.pencil').show()
        search = this.value
        $('.scotch-title').val(search)
    })

    $('.tape.left').click(() => {
        if ($(event.target).is('.tape.left')) {
            changeTape('orange')
            togglePopup()
            listenTo = $("input.tape-title").val()
            listenTo.toLowerCase()
            if (!listenTo || listenTo == 'random')
                listenTo = getRandomTape()
            if (listenTo.length > 16)
                listenTo = listenTo.slice(0, 16)
            $("input.tape-title").val(listenTo)
            window.history.pushState($(this).attr('id'), "Title", "?l=" + listenTo);
        }
    })

    $('.tape.right').click(() => {
        if ($(event.target).is('.tape.right')) {
            changeTape('purple')
            togglePopup()
            window.history.pushState($(this).attr('id'), "Title", "?p=" + localStorage.getItem('userID'));
        }
    })

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    function getRandomTape() {
        let number = getRandomInt(0, 255255255255)
        return ipTransform(number)
    }

    function prepareTape(playble, listenble) {
        if (!listenble) {
            changeTape('purple')
            let tapeTitle = playble + ' <i class="fa-solid fa-pen-to-square copy"></i>'
            $('div.tape-title').html(tapeTitle)
        }
        else {
            changeTape('orange')
            $('input.tape-title').val(listenble)
        }
    }

    function divme(a, b) {
        return (a - a % b) / b
    }

    function ipTransform(ip) {
        ip = String(ip).replaceAll('.', '').replaceAll(':', '')
        ip = Number(ip)
        let pi = ""
        while (ip > 0) {
            pi += string[ip % 36]
            ip = divme(ip, 36)
        }
        return pi
    }

    function togglePopup() {
        $('.popup').css('display', 'none')
        setTimeout(() => {
            $('.tape.glass').css('background', 'black').children('div').css('display', 'block')
            $('.tape.corner').css('display', 'block')
        }, 300)
    }  

    function changeTape(color) {

        if (color == 'orange') {
            //main - stranger
            $('.tape.glass')
                .find('div.tape-title').addClass('hide')
                .siblings('.scotch').addClass('hide')
                .siblings('input.tape-title').removeClass('hide')
                .parent().siblings('.tape-body').addClass('another')

            $('.tape.corner')
                .find('div.tape-title').removeClass('hide')
                .siblings('.scotch').removeClass('hide')
                .siblings('input.tape-title').addClass('hide')
                .parent().siblings('.tape-body').removeClass('another')
        }
        else {
            //main - yours
            $('.tape.corner')
                .find('div.tape-title').addClass('hide')
                .siblings('.scotch').addClass('hide')
                .siblings('input.tape-title').removeClass('hide')
                .parent().siblings('.tape-body').addClass('another')

            $('.tape.glass')
                .find('div.tape-title').removeClass('hide')
                .siblings('.scotch').removeClass('hide')
                .siblings('input.tape-title').addClass('hide')
                .parent().siblings('.tape-body').removeClass('another')
        }
    }

    function openCap() {
        if (!$('.cap').hasClass('open')) {
            setTimeout(() => {
                $('.tape.glass').css('background', 'black').children('div').css('display', 'none')
                $('.tape.corner').css('display', 'none')
            }, 600)
            setTimeout(() => {
                $('.popup').css('display', 'flex')
            }, 800)
        }
        $('.cap').toggleClass('open')
        $('.tape-film').toggleClass('stop')
        $('.tape-spoolbar').toggleClass('stop')
    }


})
