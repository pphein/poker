var socket = io.connect('https://poker-iyrv.onrender.com/');

var myPlayerNum = null;
var myDeviceId  = null;
var sidToPlayer = {};   // full socket.id -> player number

socket.on('player-assigned', function (data) {
    myPlayerNum = data.player;
    myDeviceId  = data.deviceId;

    /* Show join+mic buttons on own panel, speaker mute on others */
    var joinBtn = document.getElementById('pv-join-' + myPlayerNum);
    if (joinBtn) joinBtn.style.display = '';
    [1, 2, 3, 4].forEach(function (n) {
        if (n !== myPlayerNum) {
            var spk = document.getElementById('pv-spk-' + n);
            if (spk) spk.style.display = '';
        }
    });

    var badge = document.getElementById('device-badge-' + myPlayerNum);
    if (badge && badge.textContent) {
        badge.textContent = '#' + myDeviceId + ' (it\'s me)';
    }
});

socket.on('device-slots', function (slots) {
    sidToPlayer = {};
    [1, 2, 3, 4].forEach(function (n) {
        var slot = slots[n - 1];
        var badge = document.getElementById('device-badge-' + n);
        if (!badge) return;
        if (!slot) { badge.textContent = ''; return; }
        if (slot.sid) sidToPlayer[slot.sid] = slot.player;
        badge.textContent = '#' + slot.deviceId + (n === myPlayerNum ? ' (it\'s me)' : '');
    });
});

socket.on('device-full', function () {
    var overlay = document.getElementById('device-full-overlay');
    if (overlay) overlay.style.display = 'flex';
});

var initial = true;
var player = "player1";

var a1 = ['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13'];
var a2 = ['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13'];
var b1 = ['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11', 'b12', 'b13'];
var b2 = ['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11', 'b12', 'b13'];

var c1 = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10', 'c11', 'c12', 'c13'];
var c2 = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10', 'c11', 'c12', 'c13'];

var d1 = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10', 'd11', 'd12', 'd13'];
var d2 = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10', 'd11', 'd12', 'd13'];

var joker1 = ['j1', 'j2'];
var joker2 = ['j1', 'j2'];

var package = a1.concat(a2, b1, b2, c1, c2, d1, d2, joker1, joker2);

var user1 = [],
    user2 = [],
    user3 = [],
    user4 = [],
    user1_remove = [],
    user2_remove = [],
    user3_remove = [],
    user4_remove = [],
    user1_sarPhel = [],
    user2_sarPhel = [],
    user3_sarPhel = [],
    user4_sarPhel = [],
    showCard = [],
    showCardType = '',
    user1_winnerCard = [],
    user2_winnerCard = [],
    user3_winnerCard = [],
    user4_winnerCard = [];

var countShowCarduser1 = 0;
var countShowCarduser2 = 0;
var countShowCarduser3 = 0;
var countShowCarduser4 = 0;
var showCarduser1 = [];
var showCarduser2 = [];
var showCarduser3 = [];
var showCarduser4 = [];

Array.prototype.shuffle = function () {
    let m = this.length,
        i;
    while (m) {
        i = (Math.random() * m--) >>> 0;
        [this[m], this[i]] = [this[i], this[m]]
    }
    return this;
}

function saMal() {
    // document.getElementById('output').innerHTML = '';
    // // shuffle(package);
    package.shuffle();
    // package.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + "./cards/" + 'back' + ".png" + '"/>';

    // })
    // document.getElementById('saMal').value = 'မွှေမယ်';
    socket.emit('saMal', package);
};

socket.on('saMal', function (data) {
    document.getElementById('output').innerHTML = '';
    // shuffle(package);
    // data = data.shuffle();
    // console.log(data);
    data.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('output').innerHTML += '<img src="' + "./cards/" + 'back' + ".png" + '"/>';

    })
    package = data;
})

function wayMal() {

    // if (user1.length == 13) {
    //     return false;
    // }
    // user1.push(package.pop());
    // document.getElementById('user1').innerHTML = '';
    // user1.forEach(function (item) {
    //     if (player == "player1") {
    //         img = "./cards/" + item + ".png";
    //     } else {
    //         img = "./cards/back.png";
    //     }
    //     document.getElementById('user1').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';
    // })

    // user2.push(package.pop());
    // document.getElementById('user2').innerHTML = '';
    // user2.forEach(function (item) {
    //     if (player == "player1") {
    //         img = "./cards/" + item + ".png";
    //     } else {
    //         img = "./cards/back.png";
    //     }
    //     document.getElementById('user2').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })

    // user3.push(package.pop());
    // document.getElementById('user3').innerHTML = '';
    // user3.forEach(function (item) {
    //     if (player == "player1") {
    //         img = "./cards/" + item + ".png";
    //     } else {
    //         img = "./cards/back.png";
    //     }
    //     document.getElementById('user3').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })

    // user4.push(package.pop());
    // document.getElementById('user4').innerHTML = '';
    // user4.forEach(function (item) {
    //     if (player == "player1") {
    //         img = "./cards/" + item + ".png";
    //     } else {
    //         img = "./cards/back.png";
    //     }
    //     document.getElementById('user4').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('output').innerHTML = '';
    // package.forEach(function (item) {
    //     img = "./cards/" + "back" + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + img + '" />';

    // })
    socket.emit('wayMal');

}

socket.on('wayMal', function () {
    if (user1.length == 13) {
        return false;
    }
    user1.push(package.pop());
    document.getElementById('user1').innerHTML = '';
    user1.forEach(function (item) {
        if (player == "player1") {
            img = "./cards/" + item + ".png";
        } else {
            img = "./cards/back.png";
        }
        document.getElementById('user1').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';
    })

    user2.push(package.pop());
    document.getElementById('user2').innerHTML = '';
    user2.forEach(function (item) {
        if (player == "player1") {
            img = "./cards/" + item + ".png";
        } else {
            img = "./cards/back.png";
        }
        document.getElementById('user2').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })

    user3.push(package.pop());
    document.getElementById('user3').innerHTML = '';
    user3.forEach(function (item) {
        if (player == "player1") {
            img = "./cards/" + item + ".png";
        } else {
            img = "./cards/back.png";
        }
        document.getElementById('user3').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })

    user4.push(package.pop());
    document.getElementById('user4').innerHTML = '';
    user4.forEach(function (item) {
        if (player == "player1") {
            img = "./cards/" + item + ".png";
        } else {
            img = "./cards/back.png";
        }
        document.getElementById('user4').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('output').innerHTML = '';
    package.forEach(function (item) {
        img = "./cards/" + "back" + ".png";
        document.getElementById('output').innerHTML += '<img src="' + img + '" />';

    })

})

function removeItem(arr, item) {
    index = arr.indexOf(item)
    arr.splice(index, 1)
    return arr;
}

function showFirstCard() {
    // if (showCard.length >= 1) {
    //     return false;
    // }
    // showCard.push(package.pop());
    // document.getElementById('showCard').innerHTML = '';
    // showCard.forEach(function (item) {
    //     to = "'user1'";
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('showCard').innerHTML += '<img id="item" onclick="sarMaluser1()" src="' + img + '" />';

    // })
    // document.getElementById('output').innerHTML = '';
    // package.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';

    // })
    // showCardType = showCard[0][0];
    // if (showCarduser1.length == 0) {
    //     user1.forEach(element => {
    //         if (element.startsWith(showCardType)) {
    //             showCarduser1.push(element)
    //         }
    //     });
    // }
    // if (showCarduser2.length == 0) {
    //     user2.forEach(function (element) {
    //         if (element.startsWith(showCardType)) {
    //             showCarduser2.push(element)
    //         }
    //     });
    // }
    // if (showCarduser3.length == 0) {
    //     user3.forEach(function (element) {
    //         if (element.startsWith(showCardType)) {
    //             showCarduser3.push(element)
    //         }
    //     });
    // }
    // if (showCarduser4.length == 0) {
    //     user4.forEach(function (element) {
    //         if (element.startsWith(showCardType)) {
    //             showCarduser4.push(element)
    //         }
    //     });
    // }
    // if (showCarduser1.length) {
    //     document.getElementById("action-1").innerHTML += ' <input type="submit" value="သပ် အနိုင်ဆုံးဖဲပြမယ်" onclick="showWinnerCarduser1()">'
    // }
    // if (showCarduser2.length) {
    //     document.getElementById("action-2").innerHTML += ' <input type="submit" value="သပ် အနိုင်ဆုံးဖဲပြမယ်" onclick="showWinnerCarduser2()">'
    // }
    // if (showCarduser3.length) {
    //     document.getElementById("action-3").innerHTML += ' <input type="submit" value="သပ် အနိုင်ဆုံးဖဲပြမယ်" onclick="showWinnerCarduser3()">'

    // }
    // if (showCarduser4.length) {
    //     document.getElementById("action-4").innerHTML += ' <input type="submit" value="သပ် အနိုင်ဆုံးဖဲပြမယ်" onclick="showWinnerCarduser4()">'
    // }
    socket.emit('showFirstCard');
}

socket.on('showFirstCard', function () {
    if (showCard.length >= 1) {
        return false;
    }
    showCard.push(package.pop());
    document.getElementById('showCard').innerHTML = '';
    showCard.forEach(function (item) {
        to = "'user1'";
        img = "./cards/" + item + ".png";
        document.getElementById('showCard').innerHTML += '<img id="item" onclick="sarMaluser1()" src="' + img + '" />';

    })
    document.getElementById('output').innerHTML = '';
    package.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';

    })
    showCardType = showCard[0][0];
    if (showCarduser1.length == 0) {
        user1.forEach(element => {
            if (element.startsWith(showCardType)) {
                showCarduser1.push(element)
            }
        });
    }
    if (showCarduser2.length == 0) {
        user2.forEach(function (element) {
            if (element.startsWith(showCardType)) {
                showCarduser2.push(element)
            }
        });
    }
    if (showCarduser3.length == 0) {
        user3.forEach(function (element) {
            if (element.startsWith(showCardType)) {
                showCarduser3.push(element)
            }
        });
    }
    if (showCarduser4.length == 0) {
        user4.forEach(function (element) {
            if (element.startsWith(showCardType)) {
                showCarduser4.push(element)
            }
        });
    }
    if (showCarduser1.length || showCarduser2.length || showCarduser3.length || showCarduser4.length) {
        document.getElementById("action-1").innerHTML += ' <input type="submit" value="သပ် အနိုင်ဆုံးဖဲပြမယ်" onclick="autoDecide()">'
    }
})

function showWinnerCarduser1() {
    // showCarduser1 = showCarduser1.sort().reverse();
    // if (showCarduser1.length) {
    //     if (showCarduser1.includes(showCard[0])) {
    //         user1_winnerCard.push(showCard[0])
    //         showCarduser1 = removeItem(showCarduser1, showCard[0]);
    //     } else if (showCarduser1.includes(showCardType + '01')) {
    //         user1_winnerCard.push(showCardType + '01')
    //         showCarduser1 = removeItem(showCarduser1, (showCardType + '01'));
    //     } else {
    //         user1_winnerCard.push(showCarduser1[0])
    //         showCarduser1 = removeItem(showCarduser1, showCarduser1[0])
    //     }
    //     document.getElementById("user1_winnerCard").innerHTML = '';
    //     user1_winnerCard.forEach(item => {
    //         document.getElementById("user1_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
    //     });
    //     document.getElementById("user1_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser1()" />';
    //     document.getElementById("user1_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinneruser1()" />';
    socket.emit('showWinnerCarduser1');
}

socket.on('showWinnerCarduser1', function () {
    showCarduser1 = showCarduser1.sort().reverse();
    if (showCarduser1.length) {
        if (showCarduser1.includes(showCard[0])) {
            user1_winnerCard.push(showCard[0])
            showCarduser1 = removeItem(showCarduser1, showCard[0]);
        } else if (showCarduser1.includes(showCardType + '01')) {
            user1_winnerCard.push(showCardType + '01')
            showCarduser1 = removeItem(showCarduser1, (showCardType + '01'));
        } else {
            user1_winnerCard.push(showCarduser1[0])
            showCarduser1 = removeItem(showCarduser1, showCarduser1[0])
        }
        document.getElementById("user1_winnerCard").innerHTML = '';
        user1_winnerCard.forEach(item => {
            document.getElementById("user1_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
        });
        document.getElementById("user1_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser1()" />';
        document.getElementById("user1_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinneruser1()" />';
    }
})

function showWinnerCarduser2() {
    // showCarduser2 = showCarduser2.sort().reverse();
    // if (showCarduser2.length) {
    //     if (showCarduser2.includes(showCard[0])) {
    //         user2_winnerCard.push(showCard[0])
    //         showCarduser2 = removeItem(showCarduser1, showCard[0]);
    //     } else if (showCarduser2.includes(showCardType + '01')) {
    //         user2_winnerCard.push(showCardType + '01')
    //         showCarduser2 = removeItem(showCarduser2, (showCardType + '01'));
    //     } else {
    //         user2_winnerCard.push(showCarduser2[0])
    //         showCarduser2 = removeItem(showCarduser2, showCarduser2[0])
    //     }
    //     document.getElementById("user2_winnerCard").innerHTML = '';
    //     user2_winnerCard.forEach(item => {
    //         document.getElementById("user2_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
    //     });
    //     document.getElementById("user2_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser2()" />';
    //     document.getElementById("user2_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinneruser2()" />';
    // }
    socket.emit('showWinnerCarduser2')
}

socket.on('showWinnerCarduser2', function () {
    showCarduser2 = showCarduser2.sort().reverse();
    if (showCarduser2.length) {
        if (showCarduser2.includes(showCard[0])) {
            user2_winnerCard.push(showCard[0])
            showCarduser2 = removeItem(showCarduser1, showCard[0]);
        } else if (showCarduser2.includes(showCardType + '01')) {
            user2_winnerCard.push(showCardType + '01')
            showCarduser2 = removeItem(showCarduser2, (showCardType + '01'));
        } else {
            user2_winnerCard.push(showCarduser2[0])
            showCarduser2 = removeItem(showCarduser2, showCarduser2[0])
        }
        document.getElementById("user2_winnerCard").innerHTML = '';
        user2_winnerCard.forEach(item => {
            document.getElementById("user2_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
        });
        document.getElementById("user2_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser2()" />';
        document.getElementById("user2_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinneruser2()" />';
    }
})

function showWinnerCarduser3() {
    // showCarduser3 = showCarduser3.sort().reverse();

    // if (showCarduser3.length) {

    //     if (showCarduser3.includes(showCard[0])) {
    //         user3_winnerCard.push(showCard[0])
    //         showCarduser3 = removeItem(showCarduser3, showCard[0]);
    //     } else if (showCarduser3.includes(showCardType + '01')) {
    //         user3_winnerCard.push(showCardType + '01')
    //         showCarduser3 = removeItem(showCarduser3, (showCardType + '01'));
    //     } else {
    //         user3_winnerCard.push(showCarduser3[0])
    //         showCarduser3 = removeItem(showCarduser3, showCarduser3[0])
    //     }
    //     document.getElementById("user3_winnerCard").innerHTML = '';
    //     user3_winnerCard.forEach(item => {
    //         document.getElementById("user3_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
    //     });
    //     document.getElementById("user3_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser3()" />';
    //     document.getElementById("user3_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinneruser3()" />';
    // }
    socket.emit('showWinnerCarduser3');
}

socket.on('showWinnerCarduser3', function () {
    showCarduser3 = showCarduser3.sort().reverse();

    if (showCarduser3.length) {

        if (showCarduser3.includes(showCard[0])) {
            user3_winnerCard.push(showCard[0])
            showCarduser3 = removeItem(showCarduser3, showCard[0]);
        } else if (showCarduser3.includes(showCardType + '01')) {
            user3_winnerCard.push(showCardType + '01')
            showCarduser3 = removeItem(showCarduser3, (showCardType + '01'));
        } else {
            user3_winnerCard.push(showCarduser3[0])
            showCarduser3 = removeItem(showCarduser3, showCarduser3[0])
        }
        document.getElementById("user3_winnerCard").innerHTML = '';
        user3_winnerCard.forEach(item => {
            document.getElementById("user3_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
        });
        document.getElementById("user3_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser3()" />';
        document.getElementById("user3_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinneruser3()" />';
    }
})

function showWinnerCarduser4() {
    // showCarduser4 = showCarduser4.sort().reverse();
    // if (showCarduser4.length) {

    //     if (showCarduser4.includes(showCard[0])) {
    //         user4_winnerCard.push(showCard[0])
    //         showCarduser4 = removeItem(showCarduser4, showCard[0]);
    //     } else if (showCarduser4.includes(showCardType + '01')) {
    //         user4_winnerCard.push(showCardType + '01')
    //         showCarduser4 = removeItem(showCarduser4, (showCardType + '01'))
    //     } else {
    //         user4_winnerCard.push(showCarduser4[0])
    //         showCarduser4 = removeItem(showCarduser4, showCarduser4[0])
    //     }

    //     document.getElementById("user4_winnerCard").innerHTML = '';
    //     user4_winnerCard.forEach(item => {
    //         document.getElementById("user4_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
    //     });
    //     document.getElementById("user4_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser4()" />';
    //     document.getElementById("user4_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinner4()" />';
    // }
    socket.emit('showWinnerCarduser4');
}

socket.on('showWinnerCarduser4', function () {
    showCarduser4 = showCarduser4.sort().reverse();
    if (showCarduser4.length) {

        if (showCarduser4.includes(showCard[0])) {
            user4_winnerCard.push(showCard[0])
            showCarduser4 = removeItem(showCarduser4, showCard[0]);
        } else if (showCarduser4.includes(showCardType + '01')) {
            user4_winnerCard.push(showCardType + '01')
            showCarduser4 = removeItem(showCarduser4, (showCardType + '01'))
        } else {
            user4_winnerCard.push(showCarduser4[0])
            showCarduser4 = removeItem(showCarduser4, showCarduser4[0])
        }

        document.getElementById("user4_winnerCard").innerHTML = '';
        user4_winnerCard.forEach(item => {
            document.getElementById("user4_winnerCard").innerHTML += '<img src="./cards/' + item + ".png" + '"/>';
        });
        document.getElementById("user4_winnerCard").innerHTML += '<input type="submit" value="lose" onclick="firstCardLoseruser4()" />';
        document.getElementById("user4_winnerCard").innerHTML += '<input type="submit" value="win" onclick="firstCardWinner4()" />';
    }
})

function firstCardWinneruser1() {
    user1_winnerCard = [];
    showCarduser1 = [];
    document.getElementById("user1_winnerCard").innerHTML = '';
    alert("I m winner yayyyyyyy");

}

function firstCardWinneruser2() {
    user2_winnerCard = [];
    showCarduser2 = [];
    document.getElementById("user2_winnerCard").innerHTML = '';
    alert("I m winner yayyyyyyy");

}

function firstCardWinneruser3() {
    user3_winnerCard = [];
    showCarduser3 = [];
    document.getElementById("user3_winnerCard").innerHTML = '';
    alert("I m winner yayyyyyyy");

}

function firstCardWinneruser4() {
    user4_winnerCard = [];
    showCarduser4 = [];
    document.getElementById("user4_winnerCard").innerHTML = '';
    alert("I m winner yayyyyyyy");

}

function firstCardLoseruser1() {
    // user1_winnerCard = [];
    // showCarduser1 = [];
    // document.getElementById("user1_winnerCard").innerHTML = '';
    // alert("I am loser huuuuuu");
    socket.emit('firstCardLoseruser1');
}

socket.on('firstCardLoseruser1', function () {
    user1_winnerCard = [];
    showCarduser1 = [];
    document.getElementById("user1_winnerCard").innerHTML = '';
    alert("I am loser huuuuuu");
})

function firstCardLoseruser2() {
    // user2_winnerCard = [];
    // showCarduser2 = [];
    // document.getElementById("user2_winnerCard").innerHTML = '';
    // alert("I am loser huuuuuu");
    socket.emit('firstCardLoseruser2');
}

socket.on('firstCardLoseruser2', function () {
    user2_winnerCard = [];
    showCarduser2 = [];
    document.getElementById("user2_winnerCard").innerHTML = '';
    alert("I am loser huuuuuu");
})

function firstCardLoseruser3() {
    // user3_winnerCard = [];
    // showCarduser3 = [];
    // document.getElementById("user3_winnerCard").innerHTML = '';
    // alert("I am loser huuuuuu");
    socket.emit('firstCardLoseruser3');
}

socket.on('firstCardLoseruser3', function () {
    user3_winnerCard = [];
    showCarduser3 = [];
    document.getElementById("user3_winnerCard").innerHTML = '';
    alert("I am loser huuuuuu");
})

function firstCardLoseruser4() {
    // user4_winnerCard = [];
    // showCarduser4 = [];
    // document.getElementById("user4_winnerCard").innerHTML = '';
    // alert("I am loser huuuuuu");
    socket.emit('firstCardLoseruser4');
}

socket.on('firstCardLoseruser4', function () {
    user4_winnerCard = [];
    showCarduser4 = [];
    document.getElementById("user4_winnerCard").innerHTML = '';
    alert("I am loser huuuuuu");
})

function swalMaluser1() {
    // initial = false
    // if (user1.length > 13) {
    //     return false;
    // }
    // user1.push(package.pop());
    // document.getElementById('user1').innerHTML = '';
    // user1.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user1').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('output').innerHTML = '';
    // package.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';

    // })
    socket.emit('swalMaluser1');
}

socket.on('swalMaluser1', function () {
    initial = false
    if (user1.length > 13) {
        return false;
    }
    user1.push(package.pop());
    document.getElementById('user1').innerHTML = '';
    user1.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user1').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('output').innerHTML = '';
    package.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';

    })
})

function swalMaluser2() {
    // initial = false
    // if (user2.length > 13) {
    //     return false;
    // }
    // user2.push(package.pop());
    // document.getElementById('user2').innerHTML = '';
    // user2.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user2').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('output').innerHTML = '';
    // package.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';

    // })
    socket.emit('swalMaluser2')
}

socket.on('swalMaluser2', function () {
    initial = false
    if (user2.length > 13) {
        return false;
    }
    user2.push(package.pop());
    document.getElementById('user2').innerHTML = '';
    user2.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user2').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('output').innerHTML = '';
    package.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';

    })
})

function swalMaluser3() {
    // initial = false
    // if (user3.length > 13) {
    //     return false;
    // }
    // user3.push(package.pop());
    // document.getElementById('user3').innerHTML = '';
    // user3.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user3').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('output').innerHTML = '';
    // package.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';
    // })
    socket.emit('swalMaluser3');
}

socket.on('swalMaluser3', function () {
    initial = false
    if (user3.length > 13) {
        return false;
    }
    user3.push(package.pop());
    document.getElementById('user3').innerHTML = '';
    user3.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user3').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('output').innerHTML = '';
    package.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';
    })
})

function swalMaluser4() {
    // initial = false
    // if (user4.length > 13) {
    //     return false;
    // }
    // user4.push(package.pop());
    // document.getElementById('user4').innerHTML = '';
    // user4.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user4').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('output').innerHTML = '';
    // package.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';
    // })
    socket.emit('swalMaluser4');
}

socket.on('swalMaluser4', function () {
    initial = false
    if (user4.length > 13) {
        return false;
    }
    user4.push(package.pop());
    document.getElementById('user4').innerHTML = '';
    user4.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user4').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('output').innerHTML = '';
    package.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('output').innerHTML += '<img src="' + "./cards/back.png" + '"/>';
    })
})

function sarMaluser1() {
    // if (user1.length > 13) {
    //     return false
    // } else if (user1_sarPhel.length == 3) {
    //     confirm("Ready To game over???")
    // }
    // if (initial && showCard.length == 1) {
    //     sarPhel = showCard.pop();
    //     showCard = [];
    //     document.getElementById('showCard').innerHTML += '';
    //     initial = false

    // } else if (user4_remove.length) {
    //     sarPhel = user4_remove.pop();
    // } else {
    //     return false
    // }

    // user1.push(sarPhel);
    // user1_sarPhel.push(sarPhel);
    // document.getElementById('user1').innerHTML = '';
    // user1.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user1').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('user1_sarPhel').innerHTML = '';
    // user1_sarPhel.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user1_sarPhel').innerHTML += '<img src="' + img + '" />';
    // })
    socket.emit('sarMaluser1');
}

socket.on('sarMaluser1', function () {
    if (user1.length > 13) {
        return false
    } else if (user1_sarPhel.length == 3) {
        confirm("Ready To game over???")
    }
    if (initial && showCard.length == 1) {
        sarPhel = showCard.pop();
        showCard = [];
        document.getElementById('showCard').innerHTML = '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
        initial = false

    } else if (user4_remove.length) {
        sarPhel = user4_remove.pop();
        document.getElementById('user4_remove').innerHTML = '';
        user4_remove.forEach(function(item) {
            document.getElementById('user4_remove').innerHTML += '<img src="./cards/' + item + '.png" />';
        });
        document.getElementById('user4_remove').innerHTML += '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
    } else {
        return false
    }

    user1.push(sarPhel);
    user1_sarPhel.push(sarPhel);
    document.getElementById('user1').innerHTML = '';
    user1.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user1').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('user1_sarPhel').innerHTML = '';
    user1_sarPhel.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user1_sarPhel').innerHTML += '<img src="' + img + '" />';
    })
})

function sarMaluser2() {
    // if (user2.length > 13) {
    //     return false
    // } else if (user2_sarPhel.length == 3) {
    //     confirm("Ready To game over???")
    // }
    // if (initial && showCard.length == 1) {
    //     sarPhel = showCard.pop();
    //     showCard = [];
    //     document.getElementById('showCard').innerHTML += '';
    //     initial = false

    // } else if (user1_remove.length) {
    //     sarPhel = user1_remove.pop();
    // } else {
    //     return false
    // }

    // user2.push(sarPhel);
    // user2_sarPhel.push(sarPhel);
    // document.getElementById('user2').innerHTML = '';
    // user2.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user2').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('user2_sarPhel').innerHTML = '';
    // user2_sarPhel.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user2_sarPhel').innerHTML += '<img src="' + img + '" />';
    // })
    socket.emit('sarMaluser2');
}

socket.on('sarMaluser2', function () {
    if (user2.length > 13) {
        return false
    } else if (user2_sarPhel.length == 3) {
        confirm("Ready To game over???")
    }
    if (initial && showCard.length == 1) {
        sarPhel = showCard.pop();
        showCard = [];
        document.getElementById('showCard').innerHTML = '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
        initial = false

    } else if (user1_remove.length) {
        sarPhel = user1_remove.pop();
        document.getElementById('user1_remove').innerHTML = '';
        user1_remove.forEach(function(item) {
            document.getElementById('user1_remove').innerHTML += '<img src="./cards/' + item + '.png" />';
        });
        document.getElementById('user1_remove').innerHTML += '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
    } else {
        return false
    }

    user2.push(sarPhel);
    user2_sarPhel.push(sarPhel);
    document.getElementById('user2').innerHTML = '';
    user2.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user2').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('user2_sarPhel').innerHTML = '';
    user2_sarPhel.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user2_sarPhel').innerHTML += '<img src="' + img + '" />';
    })
})

function sarMaluser3() {
    // if (user3.length > 13) {
    //     return false
    // } else if (user3_sarPhel.length == 3) {
    //     confirm("Ready To game over???")
    // }
    // if (initial && showCard.length == 1) {
    //     sarPhel = showCard.pop();
    //     showCard = [];
    //     document.getElementById('showCard').innerHTML += '';
    //     initial = false

    // } else if (user2_remove.length) {
    //     sarPhel = user2_remove.pop();
    // } else {
    //     return false
    // }

    // user3.push(sarPhel);
    // user3_sarPhel.push(sarPhel);
    // document.getElementById('user3').innerHTML = '';
    // user3.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user3').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('user3_sarPhel').innerHTML = '';
    // user3_sarPhel.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user3_sarPhel').innerHTML += '<img src="' + img + '" />';
    // })
    socket.emit('sarMaluser3');
}

socket.on('sarMaluser3', function () {
    if (user3.length > 13) {
        return false
    } else if (user3_sarPhel.length == 3) {
        confirm("Ready To game over???")
    }
    if (initial && showCard.length == 1) {
        sarPhel = showCard.pop();
        showCard = [];
        document.getElementById('showCard').innerHTML = '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
        initial = false

    } else if (user2_remove.length) {
        sarPhel = user2_remove.pop();
        document.getElementById('user2_remove').innerHTML = '';
        user2_remove.forEach(function(item) {
            document.getElementById('user2_remove').innerHTML += '<img src="./cards/' + item + '.png" />';
        });
        document.getElementById('user2_remove').innerHTML += '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
    } else {
        return false
    }

    user3.push(sarPhel);
    user3_sarPhel.push(sarPhel);
    document.getElementById('user3').innerHTML = '';
    user3.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user3').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('user3_sarPhel').innerHTML = '';
    user3_sarPhel.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user3_sarPhel').innerHTML += '<img src="' + img + '" />';
    })
})

function sarMaluser4() {
    // if (user4.length > 13) {
    //     return false
    // } else if (user4_sarPhel.length == 3) {
    //     confirm("Ready To game over???")
    // }
    // if (initial && showCard.length == 1) {
    //     sarPhel = showCard.pop();
    //     showCard = [];
    //     document.getElementById('showCard').innerHTML += '';
    //     initial = false

    // } else if (user3_remove.length) {
    //     sarPhel = user3_remove.pop();
    // } else {
    //     return false
    // }

    // user4.push(sarPhel);
    // user4_sarPhel.push(sarPhel);
    // document.getElementById('user4').innerHTML = '';
    // user4.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user4').innerHTML +=
    //         '<div class="listitemClass">' +
    //         '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //         '</div>';

    // })
    // document.getElementById('user4_sarPhel').innerHTML = '';
    // user4_sarPhel.forEach(function (item) {
    //     img = "./cards/" + item + ".png";
    //     document.getElementById('user4_sarPhel').innerHTML += '<img src="' + img + '" />';
    // })
    socket.emit('sarMaluser4');
}

socket.on('sarMaluser4', function () {
    if (user4.length > 13) {
        return false
    } else if (user4_sarPhel.length == 3) {
        confirm("Ready To game over???")
    }
    if (initial && showCard.length == 1) {
        sarPhel = showCard.pop();
        showCard = [];
        document.getElementById('showCard').innerHTML = '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
        initial = false

    } else if (user3_remove.length) {
        sarPhel = user3_remove.pop();
        document.getElementById('user3_remove').innerHTML = '';
        user3_remove.forEach(function(item) {
            document.getElementById('user3_remove').innerHTML += '<img src="./cards/' + item + '.png" />';
        });
        document.getElementById('user3_remove').innerHTML += '<img src="./cards/' + sarPhel + '.png" class="card-taken" />';
    } else {
        return false
    }

    user4.push(sarPhel);
    user4_sarPhel.push(sarPhel);
    document.getElementById('user4').innerHTML = '';
    user4.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user4').innerHTML +=
            '<div class="listitemClass">' +
            '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
            '</div>';

    })
    document.getElementById('user4_sarPhel').innerHTML = '';
    user4_sarPhel.forEach(function (item) {
        img = "./cards/" + item + ".png";
        document.getElementById('user4_sarPhel').innerHTML += '<img src="' + img + '" />';
    })
})

function checkToRemove(sarPhel, htwetPhel, card) {
    sarPhelMi = false;
    htwetPhelShi = false;
    result = false;
    sarPhel.forEach(function (el) {
        if (el.endsWith(card)) {
            sarPhelMi = true;
        }
    })
    htwetPhel.forEach(function (el) {
        if (el.endsWith(card)) {
            htwetPhelShi = true;
        }
    })
    if (sarPhelMi && !htwetPhelShi) {
        result = true
    }
    return result;
}

function pyitMaluser1(x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    // if (cardName.startsWith('j')) {
    //     alert("Your card is JOKER");
    //     confirm("Are you sure to remove Joker?");
    // }
    // cardNumber = cardName.slice(1);
    // if (checkToRemove(user2_sarPhel, user2_remove, cardNumber)) {
    //     alert("Your card is not allowed");
    //     return false;
    // } else if (confirm("Are you sure to remove this")) {
    //     user1 = removeItem(user1, cardName)
    //     user1_remove.push(cardName);
    //     document.getElementById('user1_remove').innerHTML = '';
    //     user1_remove.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user1_remove').innerHTML += '<img src="' + img + '" />';

    //     })
    //     document.getElementById('user1').innerHTML = '';
    //     user1.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user1').innerHTML +=
    //             '<div class="listitemClass">' +
    //             '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //             '</div>';
    //     })
    // } else {
    //     maPyitBu(x);
    // }
    socket.emit('pyitMaluser1', x.src)
}

socket.on('pyitMaluser1', function (x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    cardName = x.match(/\/(\w+)\.png/)[1];
    if (cardName.startsWith('j')) {
        alert("Your card is JOKER");
        confirm("Are you sure to remove Joker?");
    }
    cardNumber = cardName.slice(1);
    if (checkToRemove(user2_sarPhel, user2_remove, cardNumber)) {
        alert("Your card is not allowed");
        return false;
    } else if (confirm("Are you sure to remove this")) {
        user1 = removeItem(user1, cardName)
        user1_remove.push(cardName);
        document.getElementById('user1_remove').innerHTML = '';
        user1_remove.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user1_remove').innerHTML += '<img src="' + img + '" />';

        })
        document.getElementById('user1').innerHTML = '';
        user1.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user1').innerHTML +=
                '<div class="listitemClass">' +
                '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
                '</div>';
        })
    } else {
        maPyitBu(x);
    }
})

function pyitMaluser2(x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    // if (cardName.startsWith('j')) {
    //     alert("Your card is JOKER");
    //     confirm("Are you sure to remove Joker?");
    // }
    // cardNumber = cardName.slice(1);
    // if (checkToRemove(user3_sarPhel, user3_remove, cardNumber)) {
    //     alert("Your card is not allowed");
    //     return false;
    // } else if (confirm("Are you sure to remove this")) {
    //     user2 = removeItem(user2, cardName)
    //     user2_remove.push(cardName);
    //     document.getElementById('user2_remove').innerHTML = '';
    //     user2_remove.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user2_remove').innerHTML += '<img src="' + img + '" />';

    //     })
    //     document.getElementById('user2').innerHTML = '';
    //     user2.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user2').innerHTML +=
    //             '<div class="listitemClass">' +
    //             '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //             '</div>';
    //     })
    // } else {
    //     maPyitBu(x);
    // }
    socket.emit('pyitMaluser2', x.src)
}

socket.on('pyitMaluser2', function (x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    cardName = x.match(/\/(\w+)\.png/)[1]
    if (cardName.startsWith('j')) {
        alert("Your card is JOKER");
        confirm("Are you sure to remove Joker?");
    }
    cardNumber = cardName.slice(1);
    if (checkToRemove(user3_sarPhel, user3_remove, cardNumber)) {
        alert("Your card is not allowed");
        return false;
    } else if (confirm("Are you sure to remove this")) {
        user2 = removeItem(user2, cardName)
        user2_remove.push(cardName);
        document.getElementById('user2_remove').innerHTML = '';
        user2_remove.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user2_remove').innerHTML += '<img src="' + img + '" />';

        })
        document.getElementById('user2').innerHTML = '';
        user2.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user2').innerHTML +=
                '<div class="listitemClass">' +
                '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
                '</div>';
        })
    } else {
        maPyitBu(x);
    }
})

function pyitMaluser3(x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    // if (cardName.startsWith('j')) {
    //     alert("Your card is JOKER");
    //     confirm("Are you sure to remove Joker?");
    // }
    // cardNumber = cardName.slice(1);
    // if (checkToRemove(user4_sarPhel, user4_remove, cardNumber)) {
    //     alert("Your card is not allowed");
    //     return false;
    // } else if (confirm("Are you sure to remove this")) {
    //     user3 = removeItem(user3, cardName)
    //     user3_remove.push(cardName);
    //     document.getElementById('user3_remove').innerHTML = '';
    //     user3_remove.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user3_remove').innerHTML += '<img src="' + img + '" />';

    //     })
    //     document.getElementById('user3').innerHTML = '';
    //     user3.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user3').innerHTML +=
    //             '<div class="listitemClass">' +
    //             '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //             '</div>';
    //     })
    // } else {
    //     maPyitBu(x);
    // }
    socket.emit('pyitMaluser3', x.src)
}

socket.on('pyitMaluser3', function (x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    cardName = x.match(/\/(\w+)\.png/)[1];
    if (cardName.startsWith('j')) {
        alert("Your card is JOKER");
        confirm("Are you sure to remove Joker?");
    }
    cardNumber = cardName.slice(1);
    if (checkToRemove(user4_sarPhel, user4_remove, cardNumber)) {
        alert("Your card is not allowed");
        return false;
    } else if (confirm("Are you sure to remove this")) {
        user3 = removeItem(user3, cardName)
        user3_remove.push(cardName);
        document.getElementById('user3_remove').innerHTML = '';
        user3_remove.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user3_remove').innerHTML += '<img src="' + img + '" />';

        })
        document.getElementById('user3').innerHTML = '';
        user3.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user3').innerHTML +=
                '<div class="listitemClass">' +
                '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
                '</div>';
        })
    } else {
        maPyitBu(x);
    }
})

function pyitMaluser4(x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    // if (cardName.startsWith('j')) {
    //     alert("Your card is JOKER");
    //     confirm("Are you sure to remove Joker?");
    // }
    // cardNumber = cardName.slice(1);
    // if (checkToRemove(user1_sarPhel, user1_remove, cardNumber)) {
    //     alert("Your card is not allowed");
    //     return false;
    // } else if (confirm("Are you sure to remove this")) {

    //     user4 = removeItem(user4, cardName)
    //     user4_remove.push(cardName);
    //     document.getElementById('user4_remove').innerHTML = '';
    //     user4_remove.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user4_remove').innerHTML += '<img src="' + img + '" />';

    //     })
    //     document.getElementById('user4').innerHTML = '';
    //     user4.forEach(function (item) {
    //         img = "./cards/" + item + ".png";
    //         document.getElementById('user4').innerHTML +=
    //             '<div class="listitemClass">' +
    //             '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
    //             '</div>';
    //     })
    // } else {
    //     maPyitBu(x);
    // }
    socket.emit('pyitMaluser4', x.src)
}

socket.on('pyitMaluser4', function (x) {
    // cardName = x.src.match(/\/(\w+)\.png/)[1];
    cardName = x.match(/\/(\w+)\.png/)[1];
    if (cardName.startsWith('j')) {
        alert("Your card is JOKER");
        confirm("Are you sure to remove Joker?");
    }
    cardNumber = cardName.slice(1);
    if (checkToRemove(user1_sarPhel, user1_remove, cardNumber)) {
        alert("Your card is not allowed");
        return false;
    } else if (confirm("Are you sure to remove this")) {

        user4 = removeItem(user4, cardName)
        user4_remove.push(cardName);
        document.getElementById('user4_remove').innerHTML = '';
        user4_remove.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user4_remove').innerHTML += '<img src="' + img + '" />';

        })
        document.getElementById('user4').innerHTML = '';
        user4.forEach(function (item) {
            img = "./cards/" + item + ".png";
            document.getElementById('user4').innerHTML +=
                '<div class="listitemClass">' +
                '<img onclick="readyToPyit(this)" onmouseover="bigImg(this)" onmouseout="normalImg(this)" src="' + img + '" /> ' +
                '</div>';
        })
    } else {
        maPyitBu(x);
    }
})

function maPyitBu(x) {
    normalImg(x)
    cardName = x.src.match(/\/(\w+)\.png/)[1];
    parentClass = x.parentNode;
    parentId = parentClass.parentNode.id;
    id = parentId + "_" + cardName;
    div = document.getElementById(id)
    document.getElementById(parentId).removeChild(div);

}

function bigImg(x) {
    x.style.width = "110%";
}

function normalImg(x) {
    // x.style.height = "32px";
    x.style.width = "100%";
}

var readyToPyitMal = false;

function readyToPyit(x) {
    cardName = x.src.match(/\/(\w+)\.png/)[1];
    x.id = cardName;
    parentClass = x.parentNode;
    parentId = parentClass.parentNode.id;

    // Remove any existing ပစ်မယ်/မပစ်ဘူး button div in this player's container
    var existing = document.querySelector('#' + parentId + ' > div[id^="' + parentId + '_"]');
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.id = parentId + "_" + cardName;
    pyitMalFuncName = 'pyitMal' + parentId + '(' + cardName + ')';
    maPyitBuFuncName = 'maPyitBu(' + cardName + ')';
    document.getElementById(parentId).appendChild(div);
    document.getElementById(div.id).innerHTML = '<input type="submit" value="ပစ်မယ်" onclick="' + pyitMalFuncName + '" />';
    document.getElementById(div.id).innerHTML += '<input type="submit" value="မပစ်ဘူး" onclick="' + maPyitBuFuncName + '" />';
}

function selfArrangeuser1() {
    $("#user1").touch_sortable({ updated: function () { manualSortuser1(); } });
    document.getElementById('stop-arrange-1').style.display = '';
};

function selfArrangeuser2() {
    $("#user2").touch_sortable({ updated: function () { manualSortuser2(); } });
    document.getElementById('stop-arrange-2').style.display = '';
};

function selfArrangeuser3() {
    $("#user3").touch_sortable({ updated: function () { manualSortuser3(); } });
    document.getElementById('stop-arrange-3').style.display = '';
};

function selfArrangeuser4() {
    $("#user4").touch_sortable({ updated: function () { manualSortuser4(); } });
    document.getElementById('stop-arrange-4').style.display = '';
};

function stopArrangeuser1() {
    $('#user1').children().off('.sortable').css({ cursor: '', 'user-select': '' });
    document.getElementById('stop-arrange-1').style.display = 'none';
};

function stopArrangeuser2() {
    $('#user2').children().off('.sortable').css({ cursor: '', 'user-select': '' });
    document.getElementById('stop-arrange-2').style.display = 'none';
};

function stopArrangeuser3() {
    $('#user3').children().off('.sortable').css({ cursor: '', 'user-select': '' });
    document.getElementById('stop-arrange-3').style.display = 'none';
};

function stopArrangeuser4() {
    $('#user4').children().off('.sortable').css({ cursor: '', 'user-select': '' });
    document.getElementById('stop-arrange-4').style.display = 'none';
};

function manualSortuser1() {
    const temp = [];
    var images = document.querySelectorAll('#user1 > .listitemClass > img');
    images.forEach(function (imgae) {
        temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
    });
    user1 = temp;
    $('#outputvalues1').val(user1);

}

function manualSortuser2() {
    const temp = [];
    var images = document.querySelectorAll('#user2 > .listitemClass > img');
    images.forEach(function (imgae) {
        temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
    });
    user2 = temp;
    $('#outputvalues2').val(user2);

}

function manualSortuser3() {
    const temp = [];
    var images = document.querySelectorAll('#user3 > .listitemClass > img');
    images.forEach(function (imgae) {
        temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
    });
    user3 = temp;
    $('#outputvalues3').val(user3);

}

function manualSortuser4() {
    const temp = [];
    var images = document.querySelectorAll('#user4 > .listitemClass > img');
    images.forEach(function (imgae) {
        temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
    });
    user4 = temp;
    $('#outputvalues4').val(user4);

}

function dawngPi() {
    socket.emit('dawngPi');
}

socket.on('dawngPi', function () {
    /* Reset all arrays */
    package = a1.concat(a2, b1, b2, c1, c2, d1, d2, joker1, joker2);
    user1 = []; user2 = []; user3 = []; user4 = [];
    user1_remove = []; user2_remove = []; user3_remove = []; user4_remove = [];
    user1_sarPhel = []; user2_sarPhel = []; user3_sarPhel = []; user4_sarPhel = [];
    user1_winnerCard = []; user2_winnerCard = []; user3_winnerCard = []; user4_winnerCard = [];
    showCard = []; showCardType = '';
    showCarduser1 = []; showCarduser2 = []; showCarduser3 = []; showCarduser4 = [];
    initial = true;

    /* Clear all DOM areas */
    ['user1','user2','user3','user4'].forEach(function (id) {
        document.getElementById(id).innerHTML = '';
    });
    ['user1_remove','user2_remove','user3_remove','user4_remove'].forEach(function (id) {
        document.getElementById(id).innerHTML = '';
    });
    ['user1_sarPhel','user2_sarPhel','user3_sarPhel','user4_sarPhel'].forEach(function (id) {
        document.getElementById(id).innerHTML = '';
    });
    ['user1_winnerCard','user2_winnerCard','user3_winnerCard','user4_winnerCard'].forEach(function (id) {
        document.getElementById(id).innerHTML = '';
    });
    document.getElementById('output').innerHTML = '';
    document.getElementById('showCard').innerHTML = '';

    /* Reset action rows — remove dynamically added buttons */
    [1,2,3,4].forEach(function (n) {
        var a = document.getElementById('action-' + n);
        /* keep only the original 4 inputs (စားမယ်, ဆွဲမယ်, စီမယ်, စီတာရပ်မယ်) */
        Array.from(a.querySelectorAll('input[type="submit"]')).forEach(function (btn) {
            if (btn.value === 'သပ် အနိုင်ဆုံးဖဲပြမယ်') btn.remove();
        });
        document.getElementById('stop-arrange-' + n).style.display = 'none';
    });

    /* Reset header flow buttons */
    var b = document.getElementById('btn-saMal');
    b.style.display = ''; b.disabled = false;
    document.getElementById('btn-mwhe').style.display = 'none';
    document.getElementById('btn-wayMal').style.display = '';
    document.getElementById('btn-wayMal').disabled = true;
    document.getElementById('btn-wayMal').value = 'ဝေမယ် (13)';
    document.getElementById('btn-showCard').style.display = '';
    document.getElementById('btn-showCard').disabled = true;
    document.getElementById('btn-dawngPi').style.display = 'none';
});

function autoDecide() {
    socket.emit('autoDecide');
}

socket.on('autoDecide', function () {
    var playerData = [
        { n: 1, cards: showCarduser1 },
        { n: 2, cards: showCarduser2 },
        { n: 3, cards: showCarduser3 },
        { n: 4, cards: showCarduser4 }
    ];

    /* Ace (01) counts as 14 so it ranks above 13 */
    function cardValue(card) {
        var n = parseInt(card.slice(1));
        return n === 1 ? 14 : n;
    }

    /* Sort a player's same-suit cards highest first */
    function sortedValues(cards) {
        return cards.map(cardValue).sort(function (a, b) { return b - a; });
    }

    /* Compare two sorted-value arrays; positive = a wins, negative = b wins */
    function compareHands(a, b) {
        var len = Math.max(a.length, b.length);
        for (var i = 0; i < len; i++) {
            var diff = (a[i] || 0) - (b[i] || 0);
            if (diff !== 0) return diff;
        }
        return 0;
    }

    function findWinners() {
        /* Rule 1: exact same card as လှန်ထားသောဖဲ → instant win */
        var exact = playerData.filter(function (p) {
            return p.cards.indexOf(showCard[0]) !== -1;
        });
        if (exact.length) return exact.map(function (p) { return p.n; });

        /* Rule 2: narrow to Ace holders if any; else all players with cards */
        var withAce = playerData.filter(function (p) {
            return p.cards.indexOf(showCardType + '01') !== -1;
        });
        var candidates = withAce.length
            ? withAce
            : playerData.filter(function (p) { return p.cards.length > 0; });

        if (!candidates.length) return [];

        /* Rules 3-5: compare full sorted hands card by card (highest first) */
        var bestHand = null;
        candidates.forEach(function (p) {
            var hand = sortedValues(p.cards);
            if (!bestHand || compareHands(hand, bestHand) > 0) bestHand = hand;
        });

        return candidates
            .filter(function (p) { return compareHands(sortedValues(p.cards), bestHand) === 0; })
            .map(function (p) { return p.n; });
    }

    /* Best card to display for a player */
    function getBestCard(cards) {
        if (cards.indexOf(showCard[0]) !== -1) return showCard[0];
        if (cards.indexOf(showCardType + '01') !== -1) return showCardType + '01';
        var top = sortedValues(cards)[0];
        return cards.filter(function (c) { return cardValue(c) === top; })[0];
    }

    var winnerNums = findWinners();

    playerData.forEach(function (p) {
        var el = document.getElementById('user' + p.n + '_winnerCard');
        el.innerHTML = '';
        if (!p.cards.length) {
            el.innerHTML = '<span style="color:rgba(255,255,255,0.4);font-size:11px;">ဖဲမပါ</span>'
                + '<button class="winner-close-btn" onclick="clearWinnerCard(' + p.n + ')">×</button>';
            return;
        }
        var isWinner = winnerNums.indexOf(p.n) !== -1;
        el.innerHTML =
            '<img src="./cards/' + getBestCard(p.cards) + '.png" />' +
            '<span style="margin-left:4px;font-weight:bold;font-size:13px;color:' +
            (isWinner ? '#ffd700' : '#ff6b6b') + ';">' +
            (isWinner ? '🏆 WIN' : '✗ LOSE') +
            '</span>' +
            '<button class="winner-close-btn" onclick="clearWinnerCard(' + p.n + ')">×</button>';
    });
});

function clearWinnerCard(n) {
    document.getElementById('user' + n + '_winnerCard').innerHTML = '';
}

// $(function() {
//     $('#user').touch_sortable({
//         // updated: function list() {
//         //     var temp = [];
//         //     var images = document.querySelectorAll('#user > div');
//         //     images.forEach(function(imgae) {
//         //         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//         //     });
//         //     user = temp;
//         //     alert(temp)
//         // }
//     });
//     $('#user5').touch_sortable({
//         // updated: function list() {
//         //     var temp = [];
//         //     var images = document.querySelectorAll('#user5 > div');
//         //     images.forEach(function(imgae) {
//         //         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//         //     });
//         //     user5 = temp;ခသည
//         //     alert(user5)
//         // }
//     });
//     $('#user1').touch_sortable({
//         // updated: function list() {
//         //     var temp = [];
//         //     var images = document.querySelectorAll('#user1 > div');
//         //     images.forEach(function(imgae) {
//         //         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//         //     });
//         //     user1 = temp;
//         //     alert(user1)
//         // }
//     });
//     $('#user2').touch_sortable({
//         // updated: function list() {
//         //     var temp = [];
//         //     var images = document.querySelectorAll('#user5 > div');
//         //     images.forEach(function(imgae) {
//         //         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//         //     });
//         //     user1 = temp;
//         //     alert(user1)
//         // }
//     });
//     $('#user3').touch_sortable({
//         // updated: function list() {
//         //     var temp = [];
//         //     var images = document.querySelectorAll('#user5 > div');
//         //     images.forEach(function(imgae) {
//         //         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//         //     });
//         //     user1 = temp;
//         //     alert(user1)
//         // }
//     });
//     $('#user4').touch_sortable({
//         // updated: function list() {
//         //     var temp = [];
//         //     var images = document.querySelectorAll('#user5 > div');
//         //     images.forEach(function(imgae) {
//         //         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//         //     });
//         //     user1 = temp;
//         //     alert(user1)
//         // }
//     });

// function list() {
//     var temp = [];
//     var images = document.querySelectorAll('#user > img');
//     images.forEach(function(imgae) {
//         temp.push(imgae.src.match(/\/(\w+)\.png/)[1])
//     });
//     user4 = temp;
//     alert(user4);
// };
// });
function downParP(i) {

}

function test(i, to) {
    alert(i);
    alert(to)
    from = i.parentNode.id;
    parent = document.getElementById(from);
    removeImage = document.getElementById(i.id);
    target = document.getElementById(to);
    cloneImage = removeImage.cloneNode();
    target.appendChild(cloneImage);
    parent.removeChild(removeImage);
    var clickfun = cloneImage.getAttribute("onclick");
    var funcName = clickfun.substring(0, clickfun.indexOf("("));
    cloneImage.setAttribute("onclick", funcName + "(this, '" + from + "')");
}
