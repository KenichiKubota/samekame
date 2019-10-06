'use strict';

var COLORS = {
    EMPTY: 'white'
    , NO1: '#ea5419'
    , NO2: '#0db8d9'
    , NO3: '#a2ca0e'
    , NO4: '#ffe600'
    , NO5: '#008442'
    , NO6: '#2660ac'
}

var DEFAULT_GROUP_NUM = 0;

/**
 * セルを表現するクラス
 */
var MyCell = function (address, color, elm) {
    this.address = address;
    this.color = color;
    this.elm = elm;
    this.aroundCells = {};
    this.groupNum = DEFAULT_GROUP_NUM;

    // イベントの追加
    this.elm.addEventListener('click', this.clickFunc.bind(this));
    this.elm.addEventListener('mouseover', this.mouseoverFunc.bind(this));
    this.elm.addEventListener('mouseout', this.mouseoutFunc.bind(this));

}
// マウスオーバー時の関数
MyCell.prototype.mouseoverFunc = function () {
    if (this.groupNum < DEFAULT_GROUP_NUM) {
        return;
    }
    manager.myCells.forEach(myCell => {
        if (myCell.groupNum === this.groupNum) {
            myCell.elm.classList.add('back');
        }
    })

}
// マウスアウト時の関数
MyCell.prototype.mouseoutFunc = function () {
    manager.myCells.forEach(myCell => {
        if (myCell.groupNum === this.groupNum) {
            myCell.elm.classList.remove('back');
        }
    })
}
// マウスクリック時の関数
MyCell.prototype.clickFunc = function () {

    if (this.groupNum < DEFAULT_GROUP_NUM) {
        // 消せない
        return;
    }

    // マウスアウト
    this.mouseoutFunc();

    // クリックしたのと同じGroupNumのセルを背景色白にする
    var sameGroupNums = manager.myCells.filter(myCell => {
        return (myCell.groupNum === this.groupNum);
    });
    sameGroupNums.forEach(myCell => {
        myCell.delete()
    });

    // スコアの追加
    manager.score += sameGroupNums.length * sameGroupNums.length;

    setTimeout(function () {
        manager.reset();
    }, 150)
}
// groupNumの設定
MyCell.prototype.setGroupNum = function (groupNum) {
    if (this.groupNum !== DEFAULT_GROUP_NUM) {
        return;
    }
    this.groupNum = groupNum;
    for (var prop in this.aroundCells) {
        var aroundCell = this.aroundCells[prop];
        if (aroundCell.color === this.color) {
            aroundCell.setGroupNum(groupNum);
        }
    }
}
// 上の隙間をつめる
MyCell.prototype.closeTopGap = function () {
    if (this.aroundCells.top) {
        this.color = this.aroundCells.top.color;
        this.aroundCells.top.color = COLORS.EMPTY;
        this.aroundCells.top.closeTopGap();
    }
}
// 右の隙間をつめる
MyCell.prototype.closeRightGap = function () {
    if (this.aroundCells.right) {
        this.color = this.aroundCells.right.color;
        this.aroundCells.right.color = COLORS.EMPTY;
        this.aroundCells.right.closeRightGap();
    }
}
// セルの表示変更
MyCell.prototype.show = function () {
    this.elm.classList.remove('flash');
    this.elm.classList.remove('back');
    this.elm.style.backgroundColor = this.color;
}
// セルの削除処理
MyCell.prototype.delete = function () {
    this.elm.classList.add('flash');
    this.color = COLORS.EMPTY;
}

/**
 * ゲームのマネージャークラス
 */
var GameManager = function () {
    this.rowCount;
    this.colorCount;
    this.myCells = [];
    this.myCellsPerColumn = [];
    this.score = 0;
}
GameManager.prototype.start = function (rowCount, columnCount, colorCount) {
    // プロパティの初期化
    if (rowCount < 1) {
        this.rowCount = 1;
    } else if (rowCount > 60) {
        this.rowCount = 60;
    } else {
        this.rowCount = rowCount;
    }
    if (columnCount < 1) {
        this.columnCount = 1;
    } else if (columnCount > 60) {
        this.columnCount = 60;
    } else {
        this.columnCount = columnCount;
    }

    this.colorCount = colorCount;
    this.myCells = [];
    this.myCells = [];
    this.score = 0;

    // メッセージ削除
    document.getElementById('scoreMsg').innerText = '';
    document.getElementById('clearMsg').style.display = 'none';

    // myCellsをつくる
    var tbodyElm = document.getElementById('target');
    tbodyElm.innerHTML = '';
    for (var i = 1; i <= this.rowCount; i++) {
        var trElm = document.createElement('tr');
        for (var j = 1; j <= this.columnCount; j++) {
            var tdElm = document.createElement('td');
            var address = (i - 1) * this.columnCount + j;
            var color;
            var rnd = (Math.floor(Math.random() * this.colorCount));
            if (rnd === 0) {
                color = COLORS.NO1;
            } else if (rnd % 6 === 1) {
                color = COLORS.NO2;
            } else if (rnd % 6 === 2) {
                color = COLORS.NO3;
            } else if (rnd % 6 === 3) {
                color = COLORS.NO4;
            } else if (rnd % 6 === 4) {
                color = COLORS.NO5;
            } else if (rnd % 6 === 5) {
                color = COLORS.NO6;
            }
            var myCell = new MyCell(address, color, tdElm);
            this.myCells.push(myCell);

            trElm.appendChild(tdElm);
        }
        tbodyElm.appendChild(trElm);
    }

    // aroudnCellsの設定
    for (var myCell of this.myCells) {
        var myAd = myCell.address;
        for (var aroundCell of this.myCells) {
            if (myCell === aroundCell) {
                continue;
            }
            var aroundAd = aroundCell.address;
            // 上
            if (myAd - this.columnCount > 0) {
                if (myAd - this.columnCount === aroundAd) {
                    myCell.aroundCells.top = aroundCell;
                }
            }
            // 下
            if (myAd + this.columnCount <= this.rowCount * this.columnCount) {
                if (myAd + this.columnCount === aroundAd) {
                    myCell.aroundCells.bottom = aroundCell;
                }
            }
            // 左
            if ((myAd - 1) % this.columnCount > 0) {
                if (myAd - 1 === aroundAd) {
                    myCell.aroundCells.left = aroundCell;
                }
            }
            // 右
            if ((myAd) % this.columnCount > 0) {
                if (myAd + 1 === aroundAd) {
                    myCell.aroundCells.right = aroundCell;
                }
            }

        }

    }

    // myCellsPerColumnの設定
    var topCells = this.myCells.filter(myCell => {
        return myCell.address <= this.columnCount;
    });

    topCells.forEach(topCell => {
        var perColumn = this.myCells.filter(myCell => {
            return (myCell.address - topCell.address) % this.columnCount === 0
        });
        this.myCellsPerColumn.push(perColumn);
    });

    this.myCellsPerColumn.sort(
        (columns1, columns2) => {
            return columns2[0].address - columns1[0].address;
        }
    )

    // gropuNumの設定
    this.resetAllGroupNum();

    // セルの数を表示する
    this.countColors();

    // 表示
    this.showAll();
}

// セルの数を表示する
GameManager.prototype.countColors = function () {
    var color1 = 0;
    var color2 = 0;
    var color3 = 0;
    this.myCells.forEach(myCell => {
        if (myCell.color === COLORS.NO1) {
            color1++;
        }
        if (myCell.color === COLORS.NO2) {
            color2++;
        }
        if (myCell.color === COLORS.NO3) {
            color3++;
        }
    });
    document.getElementById('color1').textContent = color1;
    document.getElementById('color2').textContent = color2;
    document.getElementById('color3').textContent = color3;
}
// 全セルのgroupNumをリセットする
GameManager.prototype.resetAllGroupNum = function () {

    // 一旦リセット
    this.myCells.forEach(myCell => {
        myCell.groupNum = DEFAULT_GROUP_NUM;
    })

    // gropuNumの再設定
    var groupNum = 0;
    for (var myCell of this.myCells) {
        groupNum++;
        myCell.setGroupNum(groupNum);
    }

    // グループ組めないものはマイナスにする
    for (var myCell of this.myCells) {
        var filtered = this.myCells.filter(innerMyCell => {
            return innerMyCell.groupNum === myCell.groupNum;
        })
        if (filtered.length <= 1) {
            myCell.groupNum = -1 * myCell.groupNum;
        }
    }

    // 空もマイナスにする
    this.myCells.forEach(myCell => {
        if (myCell.color === COLORS.EMPTY) {
            myCell.groupNum = -1 * myCell.groupNum;
        }
    })
}
// 全セルを再表示する
GameManager.prototype.showAll = function () {
    this.myCells.forEach(myCell => {
        myCell.show();
    })
}
// 
GameManager.prototype.reset = function () {

    // 上をつめる
    this.myCells.forEach(myCell => {
        if (myCell.color === COLORS.EMPTY) {
            myCell.closeTopGap();
        }
    });


    // 左をつめる
    this.myCellsPerColumn.filter(columns => {
        var filtered = columns.filter(myCell => {
            return myCell.color === COLORS.EMPTY;
        });

        if (filtered.length === columns.length) {
            columns.forEach(myCell => {
                myCell.closeRightGap();
            });
        }
    });

    // 再表示
    this.showAll();

    // groupNum再設定
    this.resetAllGroupNum();

    // スコア再設定
    document.getElementById('scoreMsg').innerText = this.score;

    // セルの数を再設定
    this.countColors();

    //　クリア判定
    var emptys = this.myCells.filter(myCell => {
        return myCell.color === COLORS.EMPTY;
    })

    if (emptys.length === this.myCells.length) {
        // クリアメッセージの表示
        document.getElementById('clearMsg').style.display = 'block';
        // ローカルストレージから過去最高点を取得
        var jsonData = localStorage.getItem('samegame');
        var oldResultObj = JSON.parse(jsonData);

        // 今回の得点が過去最高点を上回ってる場合、ローカルストレージに保存
        if (this.score > oldResultObj.score) {
            // 
            var dt = new Date();
            var y = dt.getFullYear();
            var m = ("00" + (dt.getMonth() + 1)).slice(-2);
            var d = ("00" + dt.getDate()).slice(-2);
            var today = y + "/" + m + "/" + d;

            var newResultObj = {
                playAt: today
                , score: this.score
            }

            var jsonData = JSON.stringify(newResultObj);
            localStorage.setItem('samegame', jsonData);
            document.getElementById('highScoreMsg').innerText = 'ハイスコア：' + newResultObj.score;
        }

    }


}
console.log('*******************************************************');
console.log('  以下で設定を変えて遊べます。');
console.log(' ');
console.log('  manager.start(rowCount, columnCount, colorCount);');
console.log('  - rowCount    : 一行のセル数（最大60)');
console.log('  - columnCount : 一列のセル数（最大60)');
console.log('  - colorCount  : 色の種類（最大6）');
console.log('*******************************************************');

// スコア設定
var jsonData = localStorage.getItem('samegame');
var oldResultObj = JSON.parse(jsonData);
if (oldResultObj) {
    var msg = 'ハイスコア：' + oldResultObj.score;
    document.getElementById('highScoreMsg').innerText = msg;
} else {
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth() + 1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var today = y + "/" + m + "/" + d;
    var newResultObj = {
        playAt: today
        , score: 0
    }

    var jsonData = JSON.stringify(newResultObj);
    localStorage.setItem('samegame', jsonData);
}

// ゲーム開始
var manager = new GameManager();
manager.start(13, 10, 3);

// リセットボタン設定
document.getElementById('resetBTN').addEventListener(
    'click'
    , manager.start.bind(manager, 13, 10, 3)
);