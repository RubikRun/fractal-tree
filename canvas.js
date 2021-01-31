var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight - 100;

canvas.style.position = 'absolute';
canvas.style.left = "200px";
canvas.style.top = "10px";
var ctx = canvas.getContext('2d');

let DEPTH_MAX = 14;
let depthSlider = document.getElementById("depth-slider");
let angleSlider = document.getElementById("angle-slider");
let parentChildFactorSlider = document.getElementById("parent-child-factor-slider");
let treeHeightSlider = document.getElementById("tree-height-slider");

let LEAFS_GROW_ON_DEPTH_RANGE = {min : 2, max : 10};
let LEN_PER_LEAF = 30;
let LEAF_LEN = 30;
let LEAF_ARM_LEN = 8;
let LEAF_ARM_RATIO = 0.4;

let CENTER = { x : canvas.width / 2, y : canvas.height * 8 / 9 };

//--------------------------------utils-------------------------------------------

function calcLength(A, B) {
    return Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y));
}

function getRandomNumber(a, b) {
    return Math.random() * (b - a) + a;
}

function getRandomColor(c1, c2) {
    return 'rgba('
        + Math.floor(getRandomNumber(c1.r, c2.r)) + ', '
        + Math.floor(getRandomNumber(c1.g, c2.g)) + ', '
        + Math.floor(getRandomNumber(c1.b, c2.b)) + ', '
        + '1)';
}

function drawLine(A, B) {
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
}

function drawPolygon(points, fillColor = 'black', fill = true) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    ctx.stroke();
    if (fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
}

//-------------------------------actual-program--------------------------------------

function createTree(A, B, angle, ratio, depth) {
    if (depth >= DEPTH_MAX) {
        return;
    }

    let currTree = {
        baseLine : { A : A, B : B },
        leafs : []
    };

    if (depth >= LEAFS_GROW_ON_DEPTH_RANGE.min
        && depth <= LEAFS_GROW_ON_DEPTH_RANGE.max)
    {
        let leafsCount = Math.floor(calcLength(A, B) / LEN_PER_LEAF);

        for (let i = 0; i < leafsCount; i += 1) {
            currTree.leafs.push(
                {
                    branchRatio : getRandomNumber(0, 1),
                    branchSide : Math.round(getRandomNumber(0, 1)),
                    color : getRandomColor(
                        {r : 0, g : 150, b : 0},
                        {r : 255, g : 200, b : 0}
                    )
                }
            );
        }
    }

    currTree.leftChild = createTree(
        B,
        { x : B.x + (B.x - A.x) * ratio * Math.cos(angle) + (B.y - A.y) * ratio * Math.sin(angle),
            y : B.y + (B.y - A.y) * ratio * Math.cos(angle) + (A.x - B.x) * ratio * Math.sin(angle) },
        angle,
        ratio,
        depth + 1
    );

    currTree.rightChild = createTree(
        B,
        { x : B.x + (B.x - A.x) * ratio * Math.cos(angle) + (A.y - B.y) * ratio * Math.sin(angle),
            y : B.y + (B.y - A.y) * ratio * Math.cos(angle) + (B.x - A.x) * ratio * Math.sin(angle) },
        angle,
        ratio,
        depth + 1
    );

    return currTree;
}

function updateTree(tree, A, B, angle, ratio, depth) {
    if (depth >= DEPTH_MAX) {
        return;
    }

    tree.baseLine = { A : A, B : B };

    if (tree.leftChild) {
        updateTree(
            tree.leftChild,
            B,
            { x : B.x + (B.x - A.x) * ratio * Math.cos(angle) + (B.y - A.y) * ratio * Math.sin(angle),
                y : B.y + (B.y - A.y) * ratio * Math.cos(angle) + (A.x - B.x) * ratio * Math.sin(angle) },
            angle,
            ratio,
            depth + 1
        );
    }
    if (tree.rightChild) {
        updateTree(
            tree.rightChild,
            B,
            { x : B.x + (B.x - A.x) * ratio * Math.cos(angle) + (A.y - B.y) * ratio * Math.sin(angle),
                y : B.y + (B.y - A.y) * ratio * Math.cos(angle) + (B.x - A.x) * ratio * Math.sin(angle) },
            angle,
            ratio,
            depth + 1
        );
    }
}

function drawLeaf(branchBegin, branchEnd, leaf) {
    let branchLen = calcLength(branchBegin, branchEnd);

    let leafBegin = {
        x : branchBegin.x + (branchEnd.x - branchBegin.x) * leaf.branchRatio,
        y : branchBegin.y + (branchEnd.y - branchBegin.y) * leaf.branchRatio };

    let leafEnd = { x : 0, y : 0 };
    if (leaf.branchSide) {
        leafEnd = {
            x : leafBegin.x + (branchEnd.y - branchBegin.y) * LEAF_LEN / branchLen,
            y : leafBegin.y + (branchBegin.x - branchEnd.x) * LEAF_LEN / branchLen
        };
    } else {
        leafEnd = {
            x : leafBegin.x + (branchBegin.y - branchEnd.y) * LEAF_LEN / branchLen,
            y : leafBegin.y + (branchEnd.x - branchBegin.x) * LEAF_LEN / branchLen
        };
    }

    let armPerpPoint = {
        x : leafBegin.x + (leafEnd.x - leafBegin.x) * LEAF_ARM_RATIO,
        y : leafBegin.y + (leafEnd.y - leafBegin.y) * LEAF_ARM_RATIO
    };

    let arm1 = {
        x : armPerpPoint.x + (leafEnd.y - leafBegin.y) * LEAF_ARM_LEN / LEAF_LEN,
        y : armPerpPoint.y + (leafBegin.x - leafEnd.x) * LEAF_ARM_LEN / LEAF_LEN
    };
    let arm2 = {
        x : armPerpPoint.x + (leafBegin.y - leafEnd.y) * LEAF_ARM_LEN / LEAF_LEN,
        y : armPerpPoint.y + (leafEnd.x - leafBegin.x) * LEAF_ARM_LEN / LEAF_LEN
    };

    drawPolygon(
        [leafBegin, arm1, leafEnd, arm2],
        leaf.color
    );
}

function drawTree(tree, currDepth, depthWanted) {
    if (currDepth >= depthWanted) {
        return;
    }
    drawLine(tree.baseLine.A, tree.baseLine.B);

    for (let i = 0; i < tree.leafs.length; i += 1) {
        drawLeaf(
            tree.baseLine.A,
            tree.baseLine.B,
            tree.leafs[i]
        );
    }

    if (tree.leftChild) {
        drawTree(tree.leftChild, currDepth + 1, depthWanted);
    }
    if (tree.rightChild) {
        drawTree(tree.rightChild, currDepth + 1, depthWanted);
    }
}

let tree = createTree(
    CENTER,
    { x : CENTER.x, y : CENTER.y - treeHeightSlider.value},
    angleSlider.value * Math.PI / 180,
    parentChildFactorSlider.value / 100,
    0
);

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateTree(
        tree,
        CENTER,
        { x : CENTER.x, y : CENTER.y - treeHeightSlider.value},
        angleSlider.value * Math.PI / 180,
        parentChildFactorSlider.value / 100,
        0
    );

    drawTree(tree, 0, depthSlider.value);
}

animate();