## Devlog #18 - 11/17/2025
# ~~Analysis Catalysis~~ Enzymatic Inhibition

#### ~~Hopefully no paralysis.~~ No punchline this time, I genuinely just predicted my own downfall when writing this title! Funny.

Here's probably the most complicated thing I've done so far in this project. I want to dynamically generate a diagram of the molecule on the canvas, one like this:
![Diagram](img/devlog_18_methane_diagram.png)

I've cooked up a monstrous transduction pathway that produces a diagram like this with any molecule. Here's how I did it.

## Ideas

My first thought as to how to organize the created diagram was to find the "center" atom of the molecule and draw that first, working out from there.

In order to do this, I thought the best metric for an atom's "centerness" was the sum of the distances of all other atoms to it.  
To find that, I needed some algorithms.

## Searching

The first thing I implemented on my `Molecule` class was a Breadth-First-Search function to find the shortest path from one atom to another. Here's what that looks like.
```js
findShortestPath(startId, endId) {
    const paths = [[startId]];
    const visited = new Set();
    visited.add(startId);

    while (paths.length > 0) {
        const currentPath = paths.shift();
        const currentAtom = currentPath.at(-1);

        if (currentAtom === endId) {
            return currentPath;
        }

        for (const neigh of this.findNeighborIndices(currentAtom)) {
            if (visited.has(neigh)) continue;
            visited.add(neigh);
            const newPath = [...currentAtom, neigh];
            paths.push(newPath);
        }
    }
    return null;
}
```

Once I had that, I could put it into my new `findCenterAtom` function, where I used it like this:
```js
const atomSample = this.findAllConnected(sampleeId);

let max = Infinity;
const sums = atomSample.map(aId => {
    // finding distance sums for each atom
    const distances = atomSample.filter(bId => bId !== aId).map(bId => {
        return this.findShortestPath(aId, bId).length - 1;
    });
    const sum = distances.reduce((a,b)=>a+b, 0);
    if (sum < max) max = sum;
    return sum;
});

const centers = sums.filter(sum => sum === max).map((sum, i) => atomSample[i]);
return Boolean(centers) ? centers : null;
```

As you can see, for each atom, the code:
- finds the (shortest) distances from the atom to all of the others
- sums the distances
- if the new sum is lower than the previous minimum, set it as the new one

Then, the atom, or atoms, with the least sum will win out as the center of the molecule!

## Next

And then... I hit a roadblock.

I thought about what to do next to make things work, but I couldn't think of a good solution.

- Should I just brute-force generate positions with angles in mind?
- Should I use some iterative, Markov-like simulation solver?
- Should I give up and try something else?

I have no clue what to do to finish this feature, and that's where it stands as of writing this. I'm going to work on something else, like a functional-group-identifier next.

<br>
<br>

But, yeah, there's 3 hours wasted.

[<-- Previous Devlog](DEVLOG_17.md)   [Next Devlog -->](DEVLOG_19.md)