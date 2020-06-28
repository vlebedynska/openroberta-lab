export class Utils {
    public static file_get_contents(uri): Promise<string> {
        return fetch(uri).then(res => res.text())
    }
}
