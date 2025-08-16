In this file we list couple of snippets to describe clearly what we would like



Some vocabulary first

- next line: to say that we go to the next line
- tab increment: to say + 1 to the number of tabs of the current block
- tab decrement: to say - 1....


### First method comment

First comment should follow without new line the selector 

```
addError: anErrorMessage	"Add an error information to the node. Node with error information are considered faulty.	Semantic passes that check the validity of AST are the targetted clients of this method."	| notice |	notice := OCErrorNotice new messageText: anErrorMessage.	self addNotice: notice.	^ notice
```

over

```
addError: anErrorMessage
	"Add an error information to the node. Node with error information are considered faulty.	Semantic passes that check the validity of AST are the targetted clients of this method."	| notice |	notice := OCErrorNotice new messageText: anErrorMessage.	self addNotice: notice.	^ notice
```
### First code when no comment

Favor 
```
addError: anErrorMessage	| notice |	notice := OCErrorNotice new messageText: anErrorMessage.	self addNotice: notice.	^ notice
```

over

```
addError: anErrorMessage
	| notice |	notice := OCErrorNotice new messageText: anErrorMessage.	self addNotice: notice.	^ notice
```







### Blocks 

How do we format the following 

```
reporter isOkay	ifTrue: [ self outputStreamDo: [ :str | str 
		nextPutAll: ' yes this is a long text.' 		cr;		nextPutAll:  'File ' ; 		nextPutAll: (self relativePathStringOf: file) ; 		nextPutAll: ' does not have reference problems.' ]]
```

### ifTrue: 


Do we do systematic next line and tab increment.

```
reporter isOkay	ifTrue: [ 
		self outputStreamDo: [ :str | 
			str 
				nextPutAll: ' yes this is a long text.' 				cr;				nextPutAll:  'File ' ; 				nextPutAll: (self relativePathStringOf: file) ; 				nextPutAll: ' does not have reference problems.' ]]
```






### Cascade

prefer

```
printOn: aStream	super printOn: aStream.	aStream 		<< '[ id:'; 		<<debugId asString ; 		<< ']' 
```

over 

```
printOn: aStream	super printOn: aStream.	aStream << '[ id:'; 		<<debugId asString ; 		<< ']' 
```


### Composed cascade receiver messages should not be head of the line 

```
printOn: aStream	super printOn: aStream.	aStream foo 		<< '[ id:'; 		<<debugId asString ; 		<< ']' 
```

and not 

```
printOn: aStream	super printOn: aStream.	aStream 
		foo		<< '[ id:'; 		<<debugId asString ; 		<< ']' 
```