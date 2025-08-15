In this file we list couple of snippets to describe clearly what we would like


### Cascade

prefer

```
printOn: aStream	super printOn: aStream.	debugId ifNotNil: [ 			aStream 				<< '[ id:'; 				<<debugId asString ; 				<< ']'  ]
```

over 

```
printOn: aStream	super printOn: aStream.	debugId ifNotNil: [ 			aStream << '[ id:'; 				<<debugId asString ; 				<< ']'  ]
```


### Composed cascade receiver messages should not be head of the line 

```
printOn: aStream	super printOn: aStream.	debugId ifNotNil: [ 			aStream foo 				<< '[ id:'; 				<<debugId asString ; 				<< ']'  ]
```

and not 

```
printOn: aStream	super printOn: aStream.	debugId ifNotNil: [ 			aStream 
                            foo				<< '[ id:'; 				<<debugId asString ; 				<< ']'  ]
```