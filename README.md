Pharo has two pretty printers. A dead simple one that does nearly nothing and Enlumineur which proposes around 30 customisation points to render the code. 

The logic of both of them is to take as input the AST produced by the parser and output text in a stream.

Ideally we would really like to reformat the complete Pharo code and that it looks the way we want. 
Of course as humans we are not deterministic so this is a difficult goal but let make some steps in that direction. 

This repository is to group resources around making a better code formatter for Pharo.

One of the goals is the following: 
- is there a simple systematic approach that could deliver 80% good results?
- what is the architecture of a more advanced code formatter (supporting partial reformat, double empty line conversation, comment placing)?

Let us also list what we do not want: 
- mix of single space and tab before an expression

The other files of this project
- good configurations
- list of code snippets showing what is good 
- ideas for improvements
- other approaches (such the ones in functional world)
