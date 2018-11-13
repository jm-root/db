# db

DB公用库

## 通用约定

### 排序

例如获取所有的用户，按照created_at降序排序、id升序排序, API设计如下：

```
GET /users?sorter=-created_at,+id
```

### 搜索

可以在API的Query Parameter设置一个字段为搜索的通用条件，API设计如下：

```
GET /users?search=key
```
