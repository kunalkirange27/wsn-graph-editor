const canvas = document.getElementById('graphCanvas');
const context = canvas.getContext('2d');
const contextMenu = document.getElementById('contextMenu');

let nodes = {
    'co-ordinator': [],
    'sensor': [],
    'repeater': [],
};

const validSendDirections = {
    'sensor-repeater': true,
    'repeater-repeater': true,
    'sensor-co-ordinator': true,
    'repeater-co-ordinator': true,
};

var mainNode = document.getElementById('co-ordinator-node');
var sensorNode = document.getElementById('sensor');
var repeaterNode = document.getElementById('repeater');

mainNode.addEventListener('click', function () {
    addNode('co-ordinator');
    drawNodes();
});

sensorNode.addEventListener('click', function () {
    addNode('sensor');
    drawNodes();
});

repeaterNode.addEventListener('click', function () {
    addNode('repeater');
    drawNodes();
});

var isDragging = false;
var offsetX, offsetY;
var selectedNode = null;
var selectedNodeType = null;
var connectingState = 0;
var firstSelectedNode = null;
var selectedNodes = [];
var x = 0
var y = 0
var distance = 0
var newNode
var isConnectButtonClicked = false;

canvas.addEventListener('mousedown', function (event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    // console.log(mouseX, mouseY)

    for (const type in nodes) {
        for (const node of nodes[type]) {
            distance = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2); // distance Formula
            // console.log(distance)
            if (distance < 20) {
                isDragging = true;
                offsetX = mouseX - node.x;
                offsetY = mouseY - node.y;
                selectedNode = node;
                // console.log(selectedNode)
                selectedNodeType = type;
                toggleSelectNode(node)
                break;
            }
        }
    }
});

canvas.addEventListener('mousemove', function (event) {
    if (isDragging) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        selectedNode.x = mouseX - offsetX;
        selectedNode.y = mouseY - offsetY;

        drawNodes();
    }
});

canvas.addEventListener('mouseup', function () {
    if (isDragging) {
        isDragging = false;
        selectedNode = null;
        selectedNodeType = null;
    }
});

const myEvent = new Event("click")
canvas.addEventListener("click", function (event) {
    if (!isConnectButtonClicked) {
        return;
    }
    if (selectedNodes.length === 1) {
        connectingState = 2;
        createPopupSquare("Please select another node.");
        drawNodes()
    }
});

const drawNodeEvent = new Event("click")
canvas.addEventListener("click", function () {
    if (!isConnectButtonClicked) {
        return;
    }
    if (selectedNodes.length === 2) {
        connectNodes(selectedNodes[0], selectedNodes[1]);
        resetSelection();
        drawNodes();
        drawNodes()
    }
});   

function startConnectionProcess() {
    if (selectedNodes.length === 0) {
        createPopupSquare("Please select the first node.");
        connectingState = 1;
    }
    isConnectButtonClicked = true;
    canvas.dispatchEvent(myEvent);
    canvas.dispatchEvent(drawNodeEvent);
    clearNodeStyles()
}

function createPopupSquare(message) {
    const blurBackground = document.body.children;
    for (const element of blurBackground) {
        element.classList.add('blur');
    }

    const popup = document.createElement('div');
    popup.className = 'popup-square';

    const image = document.createElement('img');
    image.className = 'popup-image';
    image.src = '../Cognifront Internship Task/alert-symbol.png';
    popup.appendChild(image);

    const messageText = document.createElement('div');
    messageText.textContent = message;
    popup.appendChild(messageText);

    document.body.appendChild(popup);

    setTimeout(() => {
        for (const element of blurBackground) {
            element.classList.remove('blur');
        }
        document.body.removeChild(popup);
    }, 1000);
}

function resetSelection() {
    connectingState = 0;
    firstSelectedNode = null;
    selectedNodes = [];
    clearNodeStyles()
    isConnectButtonClicked = false
}

function clearNodeStyles() {
    Object.values(nodes).forEach(nodeList => {
        nodeList.forEach(node => {
            node.selected = false;
        });
    });
    // isConnectButtonClicked = false
}

function clearSelection(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    let clickOnNode = false;

    for (const type in nodes) {
        for (const node of nodes[type]) {
            const distance = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
            if (distance < 20) {
                clickOnNode = true;
                break;
            }
        }
        if (clickOnNode) {
            break;
        }
    }

    if (!clickOnNode && connectingState !== 1) {
        resetSelection();
        drawNodes();
    }
}

canvas.addEventListener('click', clearSelection);


function toggleSelectNode(node) {
    if (connectingState === 0) {
        selectedNodes = [node];
    } else if (connectingState === 1) {
        firstSelectedNode = node;
        selectedNodes = [firstSelectedNode];
    } else if (connectingState === 2) {
        const sendDirection = `${firstSelectedNode.type}-${node.type}`;
        if (!validSendDirections[sendDirection]) {
            createPopupSquare('Invalid send direction. Please select nodes with valid send direction.');
            resetSelection(); // Clear the selection
            drawNodes();
            return;
        }
        selectedNodes = [firstSelectedNode, node];
    }
    clearNodeStyles();
    drawNodes();
}


// it maintains an array that contains the number of connections made by the node1, like if node1 is connected to node2 
function connectNodes(node1, node2) {
    if (nodesExistOnCanvas(node1, node2)) {
        if (!node1.connections) {
            node1.connections = [];
        }
        node1.connections.push(node2);
    }
    console.log(node1.connections)
}

function nodesExistOnCanvas(node1, node2) {
    return nodesExistInType(node1) && nodesExistInType(node2);
}

function nodesExistInType(node) {
    if (!node) return false;
    const type = getTypeOfNode(node);
    return type && nodes[type].includes(node);
}

function getTypeOfNode(node) {
    for (const type in nodes) {
        if (nodes[type].includes(node)) {
            return type;
        }
    }
    return null;
}

function drawLine(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 10;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.stroke();

    // Draw arrowhead
    // const arrowSize = 10;
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6));
    context.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fillStyle = '#000';
    context.fill();
}

function addNode(type) {
    const radius = 20;
    newNode;
    const newNodeCount = nodes[type].length + 1;

    do {
        x = Math.random() * (canvas.width - 2 * radius) + radius;
        y = Math.random() * (canvas.height - 2 * radius) + radius;
        // console.log(x,y)
        newNode = {
            id: newNodeCount,
            x: x,
            y: y,
            type: type,
        };
    } while (checkCollision(newNode, nodes[type]));

    nodes[type].push(newNode);
}

function checkCollision(newNode, typeNodes) {
    const radius = 20;

    for (const node of typeNodes) {
        const distance = Math.sqrt((node.x - newNode.x) ** 2 + (node.y - newNode.y) ** 2);
        if (distance < 2 * radius) {
            return true; // Collision
        }
    }

    return false; // No collision
}

function drawNodes() {
    context.fillStyle = 'white';
    context.clearRect(0, 0, canvas.width, canvas.height);

    Object.values(nodes).forEach(nodeList => {
        nodeList.forEach(node => {
            context.beginPath();
            context.arc(node.x, node.y, 20, 0, 2 * Math.PI);
            // arc(x, y, radius, start angle, end angle)

            switch (node.type) {
                case 'co-ordinator':
                    context.fillStyle = '#00FE00';
                    break;

                case 'sensor':
                    context.fillStyle = '#FFAB40';
                    break;

                case 'repeater':
                    context.fillStyle = '#CFE2F3';
                    break;
            }


            if (selectedNodes.includes(node)) {
                context.setLineDash([5, 5]);
                context.strokeStyle = 'red';
            } else {
                context.setLineDash([]);
                context.strokeStyle = 'black';
            }

            context.fill();
            context.lineWidth = 2;
            context.stroke();
            context.fillStyle = 'black';
            context.font = '12px Arial';

            switch (node.type) {
                case 'co-ordinator':
                    context.fillText("C" + node.id, node.x - 5, node.y + 5);
                    break;

                case 'sensor':
                    context.fillText("S" + node.id, node.x - 5, node.y + 5);
                    break;

                case 'repeater':
                    context.fillText("R" + node.id, node.x - 5, node.y + 5);
                    break;
            }

            if (node.connections) {
                node.connections.forEach(connectedNode => {
                    drawLine(node.x, node.y, connectedNode.x, connectedNode.y);
                });
                // updateConnections()
            }
        });
    });
}

function clearCanvas() {
    nodes = {
        'co-ordinator': [],
        'sensor': [],
        'repeater': [],
    };
    selectedNodes = [];
    drawNodes();
}

function showCustomContextMenu(event) {
    event.preventDefault();

    var contextMenu = document.createElement('div');
    contextMenu.className = 'custom-context-menu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    var propertiesContainer = document.createElement('div');
    propertiesContainer.className = 'node-properties-container';
    propertiesContainer.style.position = 'absolute';
    propertiesContainer.style.left = (event.pageX + 150) + 'px'; 
    propertiesContainer.style.top = event.pageY + 'px';

    var deleteOption = document.createElement('div');
    deleteOption.innerText = 'Delete Node';
    deleteOption.addEventListener('click', function() {
        if (selectedNodes.length > 0) {
            const selectedNode = selectedNodes[0];
            deleteNode(selectedNode);
            resetSelection();
            drawNodes();
        }
        console.log('Delete Node clicked');
        closeContextMenu()
    });

    var updateOption = document.createElement('div');
    updateOption.innerText = 'Update Node';
    updateOption.addEventListener('click', function() {
        update()
        console.log('Update Node clicked');
        closeContextMenu()
    });

    var viewPropertiesOption = document.createElement('div');
    viewPropertiesOption.innerText = 'View Properties';
    viewPropertiesOption.addEventListener('click', function() {
        if (selectedNodes.length > 0) {
            const selectedNode = selectedNodes[0]; 
            console.log(selectedNode)
            showNodeProperties(selectedNode, propertiesContainer);
        }
        console.log('View Properties clicked');
        
    });

    contextMenu.appendChild(deleteOption);
    contextMenu.appendChild(updateOption);
    contextMenu.appendChild(viewPropertiesOption);

    document.body.appendChild(contextMenu);
    document.body.appendChild(propertiesContainer)

    canvas.addEventListener('click', function(event) {
        if (!contextMenu.contains(event.target)) {
            closeContextMenu()
        }
    });

    function closeContextMenu() {
        if (contextMenu) {
            document.body.removeChild(contextMenu);
        }

        if (propertiesContainer) {
            document.body.removeChild(propertiesContainer);
        }
    }
}

canvas.addEventListener('contextmenu', showCustomContextMenu);

function deleteNode(node) {
    const type = getTypeOfNode(node);
    const index = nodes[type].indexOf(node);
    if (index !== -1) {
        nodes[type].splice(index, 1);
    }

    for (const otherType in nodes) {
        for (const otherNode of nodes[otherType]) {
            if (otherNode.connections) {
                const connectionIndex = otherNode.connections.indexOf(node);
                if (connectionIndex !== -1) {
                    otherNode.connections.splice(connectionIndex, 1);
                }
            }
        }
    }
}

function showNodeProperties(node, container) {
    container.innerHTML = '';
    console.log(container.innerHTML)

    const normalTxt = document.createElement('p');
    normalTxt.innerText = 'Node Properties :- ';
    container.appendChild(normalTxt);

    const eID = document.createElement('p');
    eID.innerText = '- ID : ' + (node.id);
    container.appendChild(eID);

    const eType = document.createElement('p');
    eType.innerText = '- Type : " ' + (node.type) + ' " ';
    container.appendChild(eType);

    const posX = document.createElement('p');
    posX.innerText = '- X axis : ' + (node.x);
    container.appendChild(posX);

    const posY = document.createElement('p');
    posY.innerText = '- Y axis : ' + (node.y);
    container.appendChild(posY);
}

function createNewPage() {
        nodes = {
            'co-ordinator': [],
            'sensor': [],
            'repeater': [],
        };
        selectedNodes = [];
        drawNodes();
        createPopupSquare('New graph created');
}

function update() {
    if (selectedNodes.length > 0) {
        const selectedNode = selectedNodes[0];

        const popup = document.createElement('div');
        popup.className = 'popup-square';
        popup.style.height = '200px';

        const heading = document.createElement('h3');
        heading.textContent = 'Update Node';
        heading.style.textAlign = 'center';
        popup.appendChild(heading);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Node ID:';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = selectedNode.id;

        const typeLabel = document.createElement('label');
        typeLabel.textContent = ' Node Type:';

        const typeDropdown = document.createElement('select');
        for (const type in nodes) {
            const option = document.createElement('option');
            option.value = type;
            option.text = type;
            typeDropdown.add(option);
        }
        typeDropdown.value = selectedNode.type;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', function () {
            const newID = parseInt(nameInput.value, 10); // string to num
            const newType = typeDropdown.value;

            if (isNaN(newID) || newID < 0) {
                createPopupSquare("Please enter a valid positive numeric ID.");
                return;
            }

            if (nodeExistsWithId(newID, newType)) {
                createPopupSquare(`Node ID "${newID}" already exists in Type "${newType}".`);
            } else {
                const oldType = getTypeOfNode(selectedNode);
                const index = nodes[oldType].indexOf(selectedNode);
                if (index !== -1) {
                    nodes[oldType].splice(index, 1);
                }

                selectedNode.id = newID;
                selectedNode.type = newType;

                if (!nodeExistsWithId(newID, newType)) {
                    nodes[newType].push(selectedNode);
                }

                drawNodes();
                document.body.removeChild(popup);
            }
        });

        popup.appendChild(nameLabel);
        popup.appendChild(nameInput);
        popup.appendChild(typeLabel);
        popup.appendChild(typeDropdown);
        popup.appendChild(saveButton);

        document.body.appendChild(popup);
    } else {
        createPopupSquare("No node selected.");
    }
}

function nodeExistsWithId(id, type) {
    if(nodes[type]) {
        for (const node of nodes[type]) {
            if (node.id === id) {
                return true;
            }
        }
    }
    return false;
}

function loadGraphFromJson(jsonData) {
    try {
        const graphData = JSON.parse(jsonData);

        nodes = graphData.nodes || {};

        for (const type in nodes) {
            for (const node of nodes[type]) {
                if (node.connections) {
                    node.connections = node.connections.map(connection => {
                        const connectedNode = findNodeById(connection.id, connection.type);
                        if (connectedNode) {
                            return connectedNode;
                        }
                        return connection;
                    });
                }
            }
        }

        drawNodes();
        createPopupSquare('Graph loaded from JSON');
    } catch (error) {
        createPopupSquare(`Error loading graph from JSON, ${error}`);
    }
}

function findNodeById(id, type) {
    if (nodes[type]) {
        return nodes[type].find(node => node.id === id);
    }
    return null;
}

function handleFileSelection(event) {
    const fileInput = event.target;
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        if (selectedFile.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const jsonContent = e.target.result;
                loadGraphFromJson(jsonContent);
            };
            reader.readAsText(selectedFile);
        } else {
            createPopupSquare('Unsupported file type. Please select a JSON file.');
        }
    } else {
        createPopupSquare('Please select a file');
    }
}

function openFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.click();

    fileInput.addEventListener('change', function () {
        handleFileSelection({ target: fileInput });
        document.body.removeChild(fileInput);
    });
}

function saveGraph() {
    const popup = document.createElement('div');
    popup.className = 'popup-square';

    const heading = document.createElement('h3');
    heading.textContent = 'Save Graph As';
    heading.style.marginTop = '5px'
    heading.style.marginBottom = '20px'
    heading.style.textAlign = 'center';
    popup.appendChild(heading);

    const jsonButton = document.createElement('button');
    jsonButton.textContent = 'JSON file';
    jsonButton.style.width = '200px'
    jsonButton.style.height = '100px'
    jsonButton.style.marginBottom = '20px'  
    jsonButton.addEventListener('click', function () {
        saveAsJson();
        closePopup();
    });

    const pngButton = document.createElement('button');
    pngButton.textContent = 'PNG file';
    pngButton.style.width = '200px'
    pngButton.style.height = '100px'
    pngButton.style.marginBottom = '20px'
    pngButton.addEventListener('click', function () {
        saveAsPng();
        closePopup();
    });

    popup.appendChild(jsonButton);
    popup.appendChild(pngButton);
    document.body.appendChild(popup);
}

function closePopup() {
    const popup = document.querySelector('.popup-square');
    if (popup) {
        document.body.removeChild(popup);
    }
}

function saveAsJson() {
    const graphData = {
        nodes: nodes,
    };
    const jsonData = JSON.stringify(graphData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'graph.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    createPopupSquare('Graph saved as JSON');
}

function saveAsPng() {
    html2canvas(document.getElementById('graphCanvas')).then(function (canvasScreenshot) {
        const dataURL = canvasScreenshot.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'graph.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}