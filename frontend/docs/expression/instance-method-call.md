# Instance Method Call Expression

Allows to call methods on an instance. In PdfQL is used to call methods on PDF objects.

#### InstanceMethodCall syntax
```antlr
InstanceMethodCallExpression
  : MemberExpression '.' '(' (parameters)?+ ')'
  ;
```