---
title: Hello world!
publish_date: 2022-08-10
---

This is my first blog post!

```go
// You can edit this code!
// Click here and start typing.
package main

import "fmt"

func main() {
	fmt.Println("Hello, 世界")
}
```

```python
# This playground contains the Python version of the code from the blog post
# https://hurryabit.github.io/blog/stack-safety-for-free/
import sys
from typing import Callable, Generator, TypeVar

Arg = TypeVar("Arg")
Res = TypeVar("Res")


def triangular(n: int) -> int:
    if n == 0:
        return 0
    else:
        return n + triangular(n - 1)


def trampoline(f: Callable[[Arg], Generator[Arg, Res, Res]]) -> Callable[[Arg], Res]:
    def mu_f(arg: Arg) -> Res:
        stack = []
        current = f(arg)
        res: B = None  # type: ignore

        while True:
            try:
                arg = current.send(res)
                stack.append(current)
                current = f(arg)
                res = None  # type: ignore
            except StopIteration as stop:
                if len(stack) > 0:
                    current = stack.pop()
                    res = stop.value
                else:
                    return stop.value

    return mu_f


@trampoline
def triangular_safe(n: int) -> Generator[int, int, int]:
    if n == 0:
        return 0
    else:
        return n + (yield (n - 1))


LARGE: int = sys.getrecursionlimit() + 1

assert triangular_safe(LARGE) == LARGE * (LARGE + 1) // 2
print("`triangular_safe` has not overflowed its stack.")

print("`triangular` will overflow its stack soon...")
try:
    triangular(LARGE)
    raise Exception("`triangular` has not overflowed its stack.")
except RecursionError:
    print("`triangular` has overflowed its stack.")
```
