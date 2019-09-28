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
GameManager.prototype.start = function (rowCount, colorCount) {
    // プロパティの初期化
    if (rowCount < 1) {
        this.rowCount = 1;
    } else if (rowCount > 60) {
        this.rowCount = 60;
    } else {
        this.rowCount = rowCount;
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
        for (var j = 1; j <= this.rowCount; j++) {
            var tdElm = document.createElement('td');
            var address = (i - 1) * this.rowCount + j;
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
            if (myAd - this.rowCount > 0) {
                if (myAd - this.rowCount === aroundAd) {
                    myCell.aroundCells.top = aroundCell;
                }
            }
            // 下
            if (myAd + this.rowCount <= this.rowCount * this.rowCount) {
                if (myAd + this.rowCount === aroundAd) {
                    myCell.aroundCells.bottom = aroundCell;
                }
            }
            // 左
            if ((myAd - 1) % this.rowCount > 0) {
                if (myAd - 1 === aroundAd) {
                    myCell.aroundCells.left = aroundCell;
                }
            }
            // 右
            if ((myAd) % this.rowCount > 0) {
                if (myAd + 1 === aroundAd) {
                    myCell.aroundCells.right = aroundCell;
                }
            }

        }

    }

    // myCellsPerColumnの設定
    var topCells = this.myCells.filter(myCell => {
        return myCell.address <= this.rowCount;
    });

    topCells.forEach(topCell => {
        var perColumn = this.myCells.filter(myCell => {
            return (myCell.address - topCell.address) % this.rowCount === 0
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

    // 表示
    this.showAll();
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

    //　クリア判定
    var emptys = this.myCells.filter(myCell => {
        return myCell.color === COLORS.EMPTY;
    })

    if (emptys.length === this.myCells.length) {
        document.getElementById('clearMsg').style.display = 'block';
    }


}
console.log('*******************************************************');
console.log('  以下で設定を変えて遊べます。');
console.log(' ');
console.log('  manager.start(rowCount, colorCount);');
console.log('  - rowCount   : セルの一辺の数（最大60)');
console.log('  - colorCount : 色の種類（最大6）');
console.log('*******************************************************');
var manager = new GameManager();
manager.start(12, 4);