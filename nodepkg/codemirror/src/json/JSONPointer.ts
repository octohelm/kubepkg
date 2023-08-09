export class JSONPointer {
  static parse(pointer: string): any[] {
    if (pointer === "") {
      return [];
    }
    if (pointer.charAt(0) !== "/") {
      throw new Error("Invalid JSON pointer: " + pointer);
    }
    return pointer.substring(1).split(/\//).map(JSONPointer.unescape);
  }

  static compile(keyPath: any[]) {
    if (keyPath.length === 0) {
      return "";
    }
    return "/" + keyPath.map(JSONPointer.escape).join("/");
  }


  static unescape(str: string) {
    return str.replace(/~1/g, "/").replace(/~0/g, "~");
  }

  static escape(str: string) {
    return str.toString().replace(/~/g, "~0").replace(/\//g, "~1");
  }
}
