
var courses = document.getElementsByClassName("gradebook-course");

var PRINT_VALS = false;

var course_weighted_sum = 0;
var course_credits_sum = 0;

class Course
{
	constructor()
	{
		this.cats = [];
	}

	add_category(a)
	{
		this.cats.push(a);
	}

	get_last_category()
	{
		return this.cats[this.cats.length - 1];
	}

	calculate_grade()
	{
		if(this.cats.length == 0)
		{
			var t_cat = new Category(1);
			t_cat.add_grade(1, 1);
			this.add_category(t_cat);
		}
		var avg = 0;
		for(var i = 0; i < this.cats.length; i++)
		{
			avg += this.cats[i].calculate_average();
		}

		return avg;
	}
}

class Category
{
	constructor(w)
	{
		this.weight = w;
		// this.total_given = 0;
		// this.total_max = 0;
		this.grades = []
	}

	add_grade(g, m)
	{
		let dict = {};
		dict.given = g;
		dict.max = m;
		// console.log(g + ", " + m);
		this.grades.push(dict);
		// this.total_given += g;
		// this.total_max += m;
	}

	remove_grade(i)
	{
		this.grades.splice(i, 1);
	}

	calculate_average()
	{
		var total_given = 0;
		var total_max = 0;
		// console.log(this.total_given + "/" + this.total_max);
		// console.log(this.weight);
		// console.log(this.weight*(this.total_given/this.total_max));
		// console.log("------------");
		if(this.grades.length == 0)
		{
			this.add_grade(1, 1);
		}
		for(var i in this.grades)
		{
			total_given += this.grades[i].given;
			total_max += this.grades[i].max;
			// console.log(i.given + ", " + i.max);
		}

		return this.weight*(total_given/total_max);
	}
}

//iterate over courses
for(var i = 0; i < courses.length; i++)
{
	var c = new Course();
	course_inners = courses[i].childNodes[1].firstChild.firstChild.childNodes;
	console.log("------------------");
	course_title = courses[i].firstChild.firstChild.innerHTML.split('>')[2].split('<')[0];
	console.log(course_title);

	//iterate over table rows
	for(var j = 0; j < course_inners.length; j++)
	{
		//filtering
		if(course_inners[j].getAttribute("data-parent-id") != "")
		{
			course_row_text = course_inners[j].firstChild.firstChild.firstChild.lastChild.innerHTML;

			if(course_row_text.charAt(0) == "<")
			{
				//table row is a grade
				grade_s = course_inners[j].childNodes[1].firstChild.childNodes;
				// grade_given = course_inners[j].childNodes[1].firstChild.firstChild.firstChild.innerHTML;
				// grade_max = course_inners[j].childNodes[1].firstChild.childNodes[1].innerHTML;
				grade_given = -1;
				grade_max = -1;

				for(var k in grade_s)
				{
					if(grade_s[k].className == "awarded-grade")
					{
						grade_given = grade_s[k].firstChild.innerHTML;
					}
					else if(grade_s[k].className == "max-grade")
					{
						grade_max = grade_s[k].innerHTML;
					}
					
				}
				//grade_given != "—" && (typeof grade_given !== 'undefined') && 
				if(grade_given != -1)
				{
					grade_max = grade_max.split("/")[1].substring(1);
					//console.log("\t\t" + "------------------");
					//console.log("\t\t" + grade_given + "/" + grade_max);
					grade_given = parseFloat(grade_given);
					grade_max = parseFloat(grade_max);
					c.get_last_category().add_grade(grade_given, grade_max);
					grade = grade_given/grade_max;
					if(PRINT_VALS)
					{
						console.log("\t\t" + "------------------");
						console.log("\t\t" + grade);
					}
				}
			}
			else if(!course_row_text.includes("<"))
			{
				//table row is a category
				cat_weight = parseFloat(course_row_text.split('(')[1].split('%')[0])/100;
				//filtering
				if(cat_weight == 0)
					break;
				else if(cat_weight != 1)
				{
					c.add_category(new Category(cat_weight));
					if(PRINT_VALS)
					{
						console.log("\t------------------");
						console.log("\t" + cat_weight);
					}
				}
			}
		}
	}
	var raw_final_grade = roundTo((c.calculate_grade()*100), 2)
	var final_grade = "(" + raw_final_grade + "%" + ")";
	if(!course_title.includes("Advisory"))
	{
		courses[i].firstChild.firstChild.innerHTML = courses[i].firstChild.firstChild.innerHTML + "&emsp;" + final_grade;
	}
	console.log(value(course_title, raw_final_grade));

	course_weighted_sum += value(course_title, raw_final_grade);
	course_credits_sum += 1;

	// console.log(courses[i].firstChild.firstChild.innerHTML);
	// console.log(final_grade);
	//console.log(average_grade*100);

}

// console.log(course_weighted_sum/(course_credits_sum - 1));


//https://stackoverflow.com/questions/15762768/javascript-math-round-to-two-decimal-places
function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
        if( n < 0) {
        negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
        n = (n * -1).toFixed(2);
    }
    return n;
}

function value(title, grade) {
	var ranges = [96.5, 92.5, 89.5, 86.5, 82.5, 79.5, 76.5, 72.5, 69.5, 66.5, 62.5, 59.5, 0]

	honors = false;

	if(title.includes("Honors") || title.includes("AP®"))
	{
		honors = true;
	}

	for(var i = 0; i < ranges.length; i++)
	{
		if(grade >= ranges[i])
		{
			    var values = [4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.7, 0];
			    var value = 0;
			    if (honors == 1) {
			        value += 0.5;
			    }
			    value += values[i];
			    if(title.includes("CSD") || title.includes("Programming"))
			    {
			    	value *= 0.5;
			    }
			    return value;
		}
	}
}

function most_harmful(course)
{
	
}

