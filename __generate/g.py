
import os

sections = [
    'HEAD',
    'MAIN',
    'SCRIPT',
]

def generate_file(input_lines: str, template_lines: str):
    section_map = {}
    for section in sections:
        section_map[section] = []

    current_section = ''
    for line in input_lines:
        found = False
        for section in sections:
            if ('#' + section) in line:
                current_section = section
                found = True

        if not found and current_section != '':
            section_map[current_section].append(line)

    output = ''
    for template_line in template_lines:
        found = False
        for section in sections:
            if ('$' + section) in template_line:
                found = True
                indentation = template_line[0 : template_line.find('$' + section)].count(' ')
                for line in section_map[section]:
                    if line == '\n':
                        output += line
                    else:
                        output += (indentation * ' ') + line
                break

        if not found:
            output += template_line

    return output

def main():
    template_file = open('./template.html', encoding='utf8')
    template_lines = template_file.readlines()
    template_file.close()

    for (dirpath, dirs, files) in os.walk('.', topdown=True):
        dirpath = dirpath.replace('\\', '/')
        for file in files:
            if file == 'g.py' or file == 'template.html':
                continue

            print('START ' + dirpath + '/' + file)

            input_file = open(dirpath + '/' + file, encoding='utf8')
            input_lines = input_file.readlines()
            input_file.close()

            output = generate_file(input_lines, template_lines)

            output_file = open('../' + dirpath + '/' + file, 'w', encoding='utf8')
            output_file.write(output,)
            output_file.close()

            print('END   ' + dirpath + '/' + file)

if __name__ == '__main__':
    main()
