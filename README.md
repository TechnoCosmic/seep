# Features

- Siomple snippet-based refactoring doodad
- Some esoteric editor commands

## Example settings for some C++ snippets

```
    "seep.snippets": [
        {
            "label": "If statement",
            "detail": "Surrounds the selected code in an if statement",
            "snippet": "if ( ${1:true} ) {\n$0${TM_SELECTED_TEXT}}\n\n"
        },
        {
            "label": "If-Else statement",
            "detail": "Surrounds the selected code in an if-else statement",
            "snippet": "if ( ${1:true} ) {\n${TM_SELECTED_TEXT}}\nelse {\n$0\n}"
        },
        {
            "label": "Indexed For loop",
            "detail": "Surrounds the selected code in an indexed for loop",
            "snippet": "for ( int ${1:var} = 0; ${1:var} < ${2:limit}; ++${1:var} ) {\n${TM_SELECTED_TEXT}}\n\n"
        },
        {
            "label": "Ranged For loop",
            "detail": "Surrounds the selected code in a ranged for loop",
            "snippet": "for ( auto ${1:var} : ${2:container} ) {\n${TM_SELECTED_TEXT}}\n\n"
        },
        {
            "label": "While loop",
            "detail": "Surrounds the selected code in a while loop",
            "snippet": "while ( ${1:true} ) {\n${TM_SELECTED_TEXT}}\n\n"
        },
        {
            "label": "Lambda wrapper",
            "detail": "Converts the selected code to a lambda declaration",
            "snippet": "const auto ${1:lambda}{ [ ${2:captures} ]( ${3:params} ) {\n${TM_SELECTED_TEXT}} };\n\n"
        },
    ]
```