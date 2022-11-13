function moveCard(i, to) {
    var trinketsLost = document.getElementById(to);
    var from = i.parentNode.id;
    var trinketsHeld = document.getElementById(from);
    var trinketOrig = document.getElementById(i.id);

    // clone the element (wee need the clone for positioning)
    var trinketClone = trinketOrig.cloneNode();
    //trinketClone.style.visibility = 'hidden';
    trinketsLost.appendChild(trinketClone);

    // calculate the new position, relative to the current position
    var trinketOrigTop = trinketOrig.getBoundingClientRect().top;
    var trinketOrigLeft = trinketOrig.getBoundingClientRect().left;
    var trinketCloneTop = trinketClone.getBoundingClientRect().top;
    var trinketCloneLeft = trinketClone.getBoundingClientRect().left;
    var newPositionTop = (trinketCloneTop - trinketOrigTop);
    var newPositionLeft = (trinketCloneLeft - trinketOrigLeft);

    // remove the clone (we do not need it anymore)
    trinketClone.parentNode.removeChild(trinketClone);

    // position the original at the clone's position (this triggers the transition)
    trinketOrig.style.zIndex = 1000;
    trinketOrig.style.top = newPositionTop + 'px';
    trinketOrig.style.left = newPositionLeft + 'px';

    // this will be triggered after the transition finished
    trinketOrig.addEventListener('transitionend', function() {
        //reset the positioning
        this.style.position = 'scroll';
        this.style.top = 0;
        this.style.left = 0;

        // move the trinket element in the DOM (from held to lost)
        trinketsLost.appendChild(this);
    });
    alert(from)
    changeOnClickDirection(i, from);
}

function changeOnClickDirection(i, from) {
    document.getElementById(i.id).addEventListener('click', (el) => {
        moveCard(i, from);
    })
}