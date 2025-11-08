## Devlog #6 - 11/6/2025
# Logical Chemistry

Things in this project are probably going to get complicated, so I've worked to make things as simple as possible right now. Remember last time when I took the offset calculations out of the big function and made them their own ones? Well, I've changed that again. Now, there's a dictionary.

```js
static transformFunctions = {
    'rotate one': {
        // stuff...
    },
    'rotate all': {
        // stuff...
    },
    'same distance': {
        // stuff...
    },
    'equally angled': {
        // stuff...
    },
    't intersection': {
        // stuff...
    },
}
```

Now, they're objects. I'll still need to make more specific logic for unitary cases of something, but this will be great for further option-making.

<br>
<br>

This one was short, but there'll be more.

[<-- Previous Devlog](DEVLOG_5.md)   [Next Devlog -->](DEVLOG_7.md)