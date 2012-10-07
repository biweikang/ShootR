﻿function TouchController(StartMovement, StopMovement, StopAndStartMovement, ResetMovement) {
    var that = this,
        canvas = document.getElementById("game"),
        currentTouchID = false,
        controlling = false,
        movementTouchStart,
        movementTouch,
        topOffset = HeightOffset($("#shipStats")),
        lengthOffset = 30;

    var Movement = function (from, to, dir, originCrossOver) {
        var that = this;

        that.ValidMove = function (angle) {
            if (!originCrossOver) {
                return angle >= from && angle <= to;
            }
            else {
                return (angle >= to) || (angle <= from && angle >= 0);
            }
        }

        that.Direction = dir;
        that.Active = false;
    };

    var Forward = new Movement(15, 165, "Forward"),
        Backward = new Movement(195, 345, "Backward"),
        RotatingLeft = new Movement(105, 255, "RotatingLeft"),
        RotatingRight = new Movement(75, 285, "RotatingRight", true),
        MovementList = [Forward, Backward, RotatingLeft, RotatingRight];

    function MoveShip(toStop, toStart) {
        // Need to perform a server update
        if (toStop || toStart) {
            // Need to do a startandstop
            if (toStop && toStart) {
                toStop.Active = false;
                toStart.Active = true;
                StopAndStartMovement(toStop.Direction, toStart.Direction);
            }
            else if (toStop) {
                toStop.Active = false;
                StopMovement(toStop.Direction);
            }
            else if (toStart) {
                toStart.Active = true;
                StartMovement(toStart.Direction);
            }
        }
    }

    function GetAlteredMovements() {
        if (CalculateLength(movementTouch, movementTouchStart) > lengthOffset) {
            controlling = true;
            var deltas = SubtractVectors(movementTouchStart, movementTouch),
                angle = Math.atan2(deltas.Y, deltas.X) * -180 / Math.PI;

            if (angle < 0) {
                angle += 360;
            }

            var toStop, toStart, changed = false;

            for (var i = 0; i < MovementList.length; i++) {
                var validMove = MovementList[i].ValidMove(angle);

                // This is a change
                if (!validMove && MovementList[i].Active) {
                    changed = true;
                    toStop = MovementList[i];
                }
                else if (validMove && !MovementList[i].Active) {
                    changed = true;
                    toStart = MovementList[i];
                }
            }

            return { changed: changed, toStart: toStart, toStop: toStop };
        }
        else {
            return false; // Need to reset movement
        }
    }

    function HandleStart(touch) {
        if (!currentTouchID && touch.clientX <= ($("#game").width() / 2)) {
            currentTouchID = touch.identifier;
            movementTouchStart = { X: touch.clientX, Y: touch.clientY - topOffset };
            movementTouch = { X: touch.clientX, Y: touch.clientY - topOffset };
        }
    }

    function HandleMove(touch) {
        if (currentTouchID === touch.identifier) {
            movementTouch.X = touch.clientX;
            movementTouch.Y = touch.clientY - topOffset;

            var changes = GetAlteredMovements();
            
            if (changes) {
                if (changes.changed) {
                    MoveShip(changes.toStop, changes.toStart);
                }
            }
            else { // Need to reset movement
                PerformReset();
            }

            return true;
        }

        return false;
    }

    function HandleStop(touch) {
        if (currentTouchID === touch.identifier) {
            currentTouchID = false;

            PerformReset();

            return true;
        }

        return false;
    }

    function TouchStart(e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];

            HandleStart(touch);
        }
    }

    function TouchMove(e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];

            if (HandleMove(touch)) {
                break;
            }
        }
    }

    function TouchEnd(e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];

            if (HandleStop(touch)) {
                break;
            }
        }
    }

    function PerformReset() {
        if (controlling) {
            controlling = false;

            for (var i = 0; i < MovementList.length; i++) {
                MovementList[i].Active = false;
            }

            ResetMovement();
        }
    }

    canvas.addEventListener('touchstart', TouchStart, false);
    canvas.addEventListener('touchmove', TouchMove, false);
    canvas.addEventListener('touchend', TouchEnd, false);

    var mouseGUIDS = 0,
        currentGUID = 0;

    function MouseDown(e) {
        e.preventDefault();

        var touch = e;

        e.identifier = currentGUID = mouseGUIDS++;
        HandleStart(e);
    }

    function MouseMove(e) {
        e.preventDefault();

        var touch = e;

        e.identifier = currentGUID;
        HandleMove(e);
    }

    function MouseUp(e) {
        e.preventDefault();

        var touch = e;

        e.identifier = currentGUID;
        HandleStop(e);
    }

    canvas.addEventListener('mousedown', MouseDown, false);
    canvas.addEventListener('mousemove', MouseMove, false);
    canvas.addEventListener('mouseup', MouseUp, false);

    that.Draw = function () {
        if (currentTouchID !== false) {
            CanvasContext.drawCircle(movementTouchStart.X, movementTouchStart.Y, 40, 6, "#1BFF27");
            CanvasContext.drawCircle(movementTouchStart.X, movementTouchStart.Y, 60, 2, "#1BFF27");
            CanvasContext.drawCircle(movementTouch.X, movementTouch.Y, 40, 2, "#2EBD15");
            CanvasContext.drawLine(movementTouchStart.X, movementTouchStart.Y, movementTouch.X, movementTouch.Y, 2, "#4A993C");
        }
    }
}