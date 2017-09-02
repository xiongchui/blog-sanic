import markdown2

def html():
    extras = ["fenced-code-blocks", "highlightjs-lang"]
    s = """
    ```lang-cpp
    some lang-cpp code
    ```
    """
    print(markdown2.markdown(s, extras=extras))

html()